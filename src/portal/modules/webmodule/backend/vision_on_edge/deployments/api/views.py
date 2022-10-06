# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""App API views.
"""

from __future__ import absolute_import, unicode_literals

import datetime
import logging
from distutils.util import strtobool
import json
import threading
import uuid
import yaml

from django.utils import timezone
from django.core.files.images import ImageFile

from filters.mixins import FiltersMixin
from rest_framework import filters, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_yasg2.utils import swagger_auto_schema

from ..models import Deployment
from ..symphony_client import SymphonyInstanceClient
from ...cameras.symphony_client import SymphonyDeviceClient
from ...azure_cascades.symphony_client import SymphonySkillClient
from ...compute_devices.symphony_client import SymphonyTargetClient
from ...compute_devices.symphony_client import SymphonySolutionClient
from ..iothub_receive import iothub_insights
from ...general.utils import AzureBlobClient
from ...general.shortcuts import drf_get_object_or_404
from ...azure_projects.models import Project
from ...azure_parts.models import Part
from ...images.models import Image
from .serializers import DeploymentSerializer, UploadRelabelSerializer
from ..exceptions import (
    PdExportCameraRemoved,
    PdExportInfereceReadTimeout,
    PdInferenceModuleUnreachable,
    PdProbThresholdNotInteger,
    PdProbThresholdOutOfRange,
    PdRelabelConfidenceOutOfRange,
    PdRelabelDemoProjectError,
    PdRelabelImageFull,
    PdRelabelWithoutProject,
    PdRelabelWithoutParts,
    DeploymentVideoError
)

logger = logging.getLogger(__name__)

blob_client = AzureBlobClient()
instance_client = SymphonyInstanceClient()
device_client = SymphonyDeviceClient()
target_client = SymphonyTargetClient()
solution_client = SymphonySolutionClient()
skill_client = SymphonySkillClient()


class DeploymentViewSet(FiltersMixin, viewsets.ModelViewSet):
    """Deployment ModelViewSet

    Filters:
        is_demo
    """

    queryset = Deployment.objects.all()
    serializer_class = DeploymentSerializer

    def get_queryset(self):
        queryset = Deployment.objects.all()
        for deployment_obj in queryset:
            deployment_obj.status = deployment_obj.get_status()
            deployment_obj.skip_signals = True  # only update column, skip symphony api
            deployment_obj.save()
        return queryset

    @swagger_auto_schema(
        operation_summary="Upload a relabel image.",
        request_body=UploadRelabelSerializer(),
    )
    @action(detail=False, methods=["post"], url_path="upload_relabel_image")
    def upload_relabel_image(self, request) -> Response:
        """upload_relabel_image.

        Args:
            request:
        """
        queryset = self.get_queryset()
        serializer = UploadRelabelSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        project_obj = Project.objects.filter(
            symphony_id=serializer.validated_data["project_symphony_id"]).first()
        if project_obj is None:
            raise PdRelabelWithoutProject
        if project_obj.is_demo:
            raise PdRelabelDemoProjectError

        # FIXME: Inferenece should send part id instead of part_name
        part = Part.objects.filter(
            project=project_obj, name=serializer.validated_data["part_name"]).first()

        if part is None:
            raise PdRelabelWithoutParts

        # Relabel images count does not exceed project.maxImages
        # Handled by signals

        confidence_float = serializer.validated_data["confidence"] * 100
        # Confidence check
        # maybe check from inferencemodule
        # if (
        #     confidence_float < instance.accuracyRangeMin
        #     or confidence_float > instance.accuracyRangeMax
        # ):
        #     logger.error("Inferenece confidence %s out of range", confidence_float)
        #     raise PdRelabelConfidenceOutOfRange

        # Relabel images count does not exceed project.maxImages
        if (
            serializer.validated_data['max_images']
            > Image.objects.filter(
                project=project_obj, part_ids__contains='"{}"'.format(str(part.id)), is_relabel=True
            ).count()
        ):
            img_io = serializer.validated_data["img"].file

            img = ImageFile(img_io)
            img.name = str(timezone.now()) + ".jpg"
            labels = json.loads(serializer.validated_data["labels"])
            labels[0]['part'] = part.id
            part_ids = [str(part.id)]
            img_obj = Image(
                image=img,
                part_id=part.id,
                part_ids=json.dumps(part_ids),
                labels=json.dumps(labels),
                confidence=serializer.validated_data["confidence"],
                project=project_obj,
                is_relabel=True,
            )
            img_obj.save()
            return Response({"status": "ok"})

        # User is not relabling and exceed maxImages
        # queue...
        logger.info(project_obj.relabel_expired_time)
        logger.info(timezone.now())
        if project_obj.relabel_expired_time < timezone.now():
            logger.info("Queuing relabel images...")
            img_io = serializer.validated_data["img"].file
            img = ImageFile(img_io)
            img.name = str(timezone.now()) + ".jpg"
            labels = json.loads(serializer.validated_data["labels"])
            labels[0]['part'] = part.id
            part_ids = [str(part.id)]
            img_obj = Image(
                image=img,
                part_id=part.id,
                part_ids=json.dumps(part_ids),
                labels=json.dumps(labels),
                confidence=serializer.validated_data["confidence"],
                project=project_obj,
                is_relabel=True,
            )
            img_obj.save()
            # pop
            earliest_img = (
                Image.objects.filter(project=project_obj, part_ids__contains='"{}"'.format(
                    str(part.id)), is_relabel=True)
                .order_by("timestamp")
                .first()
            )
            if earliest_img is not None:
                earliest_img.delete()
            return Response({"status": "ok"})
            # pop image

        # User is relabeling and exceed maxImages
        for _ in range(
            Image.objects.filter(
                project=project_obj, part_ids__contains='"{}"'.format(str(part.id)), is_relabel=True
            ).count()
            - serializer.validated_data['max_images']
        ):
            Image.objects.filter(
                project=project_obj, part_ids__contains='"{}"'.format(str(part.id)), is_relabel=True
            ).order_by("timestamp").last().delete()
        raise PdRelabelImageFull

    @action(detail=False, methods=["get"], url_path="list_deployment_videos")
    def list_deployment_videos(self, request, pk=None):
        # queryset = self.get_queryset()
        # instance = drf_get_object_or_404(queryset, pk=pk)
        # instance_displayname = instance.name

        instance_displayname = request.query_params.get("instance_displayname")
        skill_displayname = request.query_params.get("skill_displayname")
        device_displayname = request.query_params.get("device_displayname")

        logger.warning(
            f'Params: {instance_displayname}, {skill_displayname}, {device_displayname}')

        if instance_displayname and skill_displayname and device_displayname:
            return Response(blob_client.list_video_blobs(instance_displayname, skill_displayname, device_displayname))
        else:
            raise DeploymentVideoError

    @action(detail=False, methods=["get"], url_path="list_deployment_insights")
    def list_deployment_insights(self, request, pk=None):
        # queryset = self.get_queryset()
        # instance = drf_get_object_or_404(queryset, pk=pk)
        # instance_id = instance.symphony_id

        instance_symphony_id = request.query_params.get("instance_symphony_id")
        skill_symphony_id = request.query_params.get("skill_symphony_id")
        device_symphony_id = request.query_params.get("device_symphony_id")

        logger.warning(
            f'Retrieving iothub insight parameters:{instance_symphony_id}/{skill_symphony_id}/{device_symphony_id}')

        return Response(iothub_insights.get(instance_symphony_id, {}).get(skill_symphony_id, {}).get(device_symphony_id, []))

    @action(detail=False, methods=["get"], url_path="get_properties")
    def get_properties(self, request, pk=None):

        symphony_id = request.query_params.get("symphony_id")

        logger.warning(f"Retrieving instance [{symphony_id}] config.")

        return Response(yaml.dump(instance_client.get_config_from_symphony(symphony_id)))

    @action(detail=False, methods=["get"], url_path="get_symphony_objects")
    def get_symphony_objects(self, request):

        symphony_id = request.query_params.get("symphony_id")
        logger.warning(f"Retrieving all instance configs.")
        return Response(instance_client.get_objects())

    @action(detail=False, methods=["get"], url_path="get_symphony_object")
    def get_symphony_object(self, request):

        symphony_id = request.query_params.get("symphony_id")

        if symphony_id:
            logger.warning(f"Retrieving instance [{symphony_id}] config.")

            return Response(instance_client.get_object(symphony_id))
        else:
            raise ValidationError("Not providing symphony_id")

    @action(detail=False, methods=["post"], url_path="create_symphony_object")
    def create_symphony_object(self, request):

        symphony_id = 'instance-' + str(uuid.uuid4())

        from ...azure_cascades.models import Cascade
        from ...azure_settings.models import Setting
        from ..iothub_receive import receive_events_from_iothub

        configure = json.loads(request.data.get("configure"))

        skill_env, skill_params, configure_data, module_routes = process_configure(
            configure, request.data.get("name"))

        skill_params["configure_data"] = json.dumps(configure_data)

        # update solution to the target
        target_obj = target_client.get_object(request.data.get("compute_device"))
        solution_client.set_attr(
            {
                "name": target_obj["solution_id"],
                "display_name": target_obj["solution_id"] + '-' + str(uuid.uuid4())[-4:],
                "skills": json.dumps(skill_env),
                "acceleration": target_obj["acceleration"],
                "architecture": target_obj["architecture"],
                "instance": symphony_id,
                "iothub": target_obj["iothub"],
                "iotedge_device": target_obj["iotedge_device"],
                "module_routes": module_routes,
                "is_k8s": target_obj["is_k8s"]
            }
        )

        # create/update instance
        instance_client.set_attr({
            "name": symphony_id,
            "display_name": request.data.get("name"),
            "target": target_obj["symphony_id"],
            "solution": target_obj["solution_id"],
            "params": skill_params,
            "tag_list": request.data.get("tag_list", "[]"),
        })

        # create
        solution_client.update_config(name=target_obj["solution_id"])
        instance_client.deploy_config()

        # monitor iothub messages
        iothub = target_obj["iothub"]
        setting_obj = Setting.objects.all().first()
        iothub_list = json.loads(setting_obj.monitored_iothubs)
        if iothub not in iothub_list:
            iothub_list.append(iothub)
            setting_obj.monitored_iothubs = json.dumps(iothub_list)
            setting_obj.save()
            threading.Thread(target=receive_events_from_iothub,
                             args=(iothub,), daemon=True).start()

            logger.warning(f"Start monitoring iothub: {iothub}")
        else:
            logger.warning(f"Iothub: {iothub} already being monitored")
        return Response(instance_client.get_object(symphony_id))

    @action(detail=False, methods=["patch"], url_path="update_symphony_object")
    def update_symphony_object(self, request):

        symphony_id = request.query_params.get("symphony_id")
        instance_obj = instance_client.get_object(symphony_id)
        target_obj = target_client.get_object(instance_obj["compute_device"])

        configure = json.loads(request.data.get("configure"))

        skill_env, skill_params, configure_data, module_routes = process_configure(
            configure, instance_obj["name"])

        skill_params["configure_data"] = json.dumps(configure_data)

        # update solution to the target
        solution_client.set_attr(
            {
                "name": target_obj["solution_id"],
                "display_name": target_obj["solution_id"] + '-' + str(uuid.uuid4())[-4:],
                "skills": json.dumps(skill_env),
                "acceleration": target_obj["acceleration"],
                "architecture": target_obj["architecture"],
                "instance": symphony_id,
                "iothub": target_obj["iothub"],
                "iotedge_device": target_obj["iotedge_device"],
                "module_routes": module_routes,
                "is_k8s": target_obj["is_k8s"]
            }
        )

        # create/update instance
        instance_client.set_attr({
            "params": skill_params,
            "tag_list": request.data.get("tag_list", "[]"),
        })

        # update
        solution_client.update_config(name=target_obj["solution_id"])
        instance_client.patch_config(name=symphony_id)

        instance_client.patch_config(name=symphony_id)
        return Response(instance_client.get_object(symphony_id))

    @action(detail=False, methods=["delete"], url_path="delete_symphony_object")
    def delete_symphony_object(self, request):

        symphony_id = request.query_params.get("symphony_id")

        instance_client.remove_config(name=symphony_id)
        return Response(status=status.HTTP_204_NO_CONTENT)


def process_configure(configure, displayname):
    skill_env = []
    skill_params = {}
    # for recovering data from symphony -> {"camera_name": [skill_names]}
    configure_data = {}
    module_routes = []
    for cam in configure:
        device_obj = device_client.get_object(cam['camera'])
        configure_data[device_obj["symphony_id"]] = []
        for skill in cam['skills']:
            skill_obj = skill_client.get_object(skill['id'])
            skill_alias = str(uuid.uuid4())[-4:]
            skill_env.append(f"{skill_obj['symphony_id']} as skill-{skill_alias}")
            skill_params[
                f"skill-{skill_alias}.rtsp"] = f"rtsp://{device_obj['username']}:{device_obj['password']}@{device_obj['rtsp'].split('rtsp://')[1]}"
            skill_params[f"skill-{skill_alias}.fps"] = skill_obj["fps"]
            skill_params[f"skill-{skill_alias}.device_id"] = device_obj["symphony_id"]
            skill_params[f"skill-{skill_alias}.instance_displayname"] = displayname
            skill_params[f"skill-{skill_alias}.device_displayname"] = device_obj["name"]
            skill_params[f"skill-{skill_alias}.skill_displayname"] = skill_obj["name"]
            configure_data[device_obj["symphony_id"]].append(skill_obj["symphony_id"])

            # check whether there is iotedge_export node and set route
            spec = skill_obj["flow"]
            for node in spec["nodes"]:
                if node["type"] == "export" and node["name"] == "iotedge_export":
                    module_routes.append({
                        "module_name": node["configurations"]["module_name"],
                        "module_input": node["configurations"]["module_input"]
                    })
    return skill_env, skill_params, configure_data, module_routes
