# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""App API views.
"""

from __future__ import absolute_import, unicode_literals

import datetime
import logging
from distutils.util import strtobool
import json
from django.utils import timezone
from django.core.files.images import ImageFile

from filters.mixins import FiltersMixin
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_yasg2.utils import swagger_auto_schema

from ..models import Deployment
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

    @action(detail=True, methods=["get"], url_path="list_deployment_videos")
    def list_deployment_videos(self, request, pk=None):
        queryset = self.get_queryset()
        instance = drf_get_object_or_404(queryset, pk=pk)
        instance_displayname = instance.name
        skill_displayname = request.query_params.get("skill_displayname")
        device_displayname = request.query_params.get("device_displayname")

        logger.warning(
            f'Params: {instance_displayname}, {skill_displayname}, {device_displayname}')

        if instance_displayname and skill_displayname and device_displayname:
            return Response(blob_client.list_video_blobs(instance_displayname, skill_displayname, device_displayname))
        else:
            raise DeploymentVideoError

    @action(detail=True, methods=["get"], url_path="list_deployment_insights")
    def list_deployment_insights(self, request, pk=None):
        queryset = self.get_queryset()
        instance = drf_get_object_or_404(queryset, pk=pk)
        instance_id = instance.symphony_id
        skill_symphony_id = request.query_params.get("skill_symphony_id")
        device_symphony_id = request.query_params.get("device_symphony_id")

        logger.warning(f'Retrieving iothub insight parameters:{instance_id}/{skill_symphony_id}/{device_symphony_id}')

        return Response(iothub_insights.get(instance_id, {}).get(skill_symphony_id, {}).get(device_symphony_id, []))
