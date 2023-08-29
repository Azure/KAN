# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""App API views.
"""

import logging
import uuid
import yaml
import base64

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError

from ..models import ComputeDevice
from ..symphony_client import SymphonyTargetClient
from ..symphony_client import SymphonySolutionClient
from .serializers import ComputeDeviceSerializer
from ..utils import list_iothub, list_devices
from ...general.shortcuts import drf_get_object_or_404

logger = logging.getLogger(__name__)

target_client = SymphonyTargetClient()
solution_client = SymphonySolutionClient()


class ComputeDeviceViewSet(viewsets.ModelViewSet):
    queryset = ComputeDevice.objects.all()
    serializer_class = ComputeDeviceSerializer

    def create(self, request):

        serialized_data = self.serializer_class(data=request.data)
        # logger.warning('serialized data type:%s'%type(serialized_data))
        if serialized_data.is_valid():
            logger.info("is_valid")
            serialized_data.save()

            return Response(data=serialized_data.data, status=201)
        return Response(serialized_data.errors, status=400)

    @action(detail=False, methods=["get"], url_path="list-iothub")
    def get_iothub(self, request):
        logger.warning(request.query_params)
        iothub_list = list_iothub()
        return Response(data={"iothub": iothub_list}, status=200)

    @action(detail=False, methods=["get"], url_path="list-devices")
    def get_devices(self, request):
        logger.warning(request.query_params)
        iothub_name = request.query_params.get('iothub', None)
        if not iothub_name:
            raise ValidationError("Not providing iothub name")
        device_list = list_devices(iothub_name)
        return Response(data={"devices": device_list}, status=200)

    @action(detail=False, methods=["delete"], url_path="bulk-delete")
    def bulk_delete(self, request):
        logger.warning(request)
        logger.warning(request.query_params)
        ids = request.query_params.getlist('id', None)
        if not ids:
            raise ValidationError("Not providing ids data")
        # this would not trigger pre/post delete, get instance and delete if needed
        # ComputeDevice.objects.filter(id__in=ids).all().delete()
        for symphony_id in ids:
            target_client.remove_config(name=symphony_id)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["get"], url_path="update_status")
    def update_status(self, request, pk=None):
        queryset = self.get_queryset()
        compute_device_obj = drf_get_object_or_404(queryset, pk=pk)
        compute_device_obj.status = compute_device_obj.get_status()
        compute_device_obj.skip_signals = True  # only update column, skip symphony api
        compute_device_obj.save()

        serializer = ComputeDeviceSerializer(compute_device_obj)

        logger.warning('Retrieving target status')

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="get_properties")
    def get_properties(self, request, pk=None):

        symphony_id = request.query_params.get("symphony_id")

        logger.warning(f"Retrieving target [{symphony_id}] config.")

        return Response(yaml.dump(target_client.get_config_from_symphony(symphony_id)))

    @action(detail=False, methods=["get"], url_path="get_symphony_objects")
    def get_symphony_objects(self, request):

        symphony_id = request.query_params.get("symphony_id")
        logger.warning(f"Retrieving all targets config.")
        return Response(target_client.get_objects())

    @action(detail=False, methods=["get"], url_path="get_symphony_object")
    def get_symphony_object(self, request):

        symphony_id = request.query_params.get("symphony_id")

        if symphony_id:
            logger.warning(f"Retrieving target [{symphony_id}] config.")
            target = target_client.get_object(symphony_id)

            return Response(target)
        else:
            raise ValidationError("Not providing symphony_id")

    @action(detail=False, methods=["post"], url_path="create_symphony_object")
    def create_symphony_object(self, request):

        target_symphony_id = 'target-' + str(uuid.uuid4())
        solution_symphony_id = 'solution-' + str(uuid.uuid4())

        # config_data: k8s config (base64 encoded)
        config_data = base64.b64decode(
            request.data.get("config_data", "")).decode('utf8')

        target_client.set_attr({
            "name": target_symphony_id,
            "iothub": request.data.get("iothub", ""),
            "iotedge_device": request.data.get("iotedge_device", ""),
            "architecture": request.data.get("architecture", ""),
            "acceleration": request.data.get("acceleration", ""),
            "is_k8s": request.data.get("is_k8s", False),
            "cluster_type": request.data.get("cluster_type", "current"),
            "config_data": config_data,
            "solution_id": solution_symphony_id,
            "display_name": request.data.get("name", ""),
            "tag_list": request.data.get("tag_list", "[]"),
        })

        solution_client.set_attr({
            "name": solution_symphony_id,
            "acceleration": request.data.get("acceleration", ""),
            "architecture": request.data.get("architecture", ""),
            "iothub": request.data.get("iothub", ""),
            "iotedge_device": request.data.get("iotedge_device", ""),
            "is_k8s": request.data.get("is_k8s", False)
        })

        target_client.deploy_config()
        solution_client.deploy_config()
        return Response(target_client.get_object(target_symphony_id))

    @action(detail=False, methods=["post"], url_path="verify_config_data")
    def verify_config_data(self, request):

        from kubernetes import client, config

        # config_data: k8s config (base64 encoded)
        try:
            config_data = base64.b64decode(
                request.data.get("config_data", "")).decode('utf8')
            config_json = yaml.safe_load(config_data)
            config.load_kube_config_from_dict(config_json)
            api = client.CoreV1Api()
            ret = api.list_pod_for_all_namespaces(watch=False)

            return Response(status=status.HTTP_200_OK)

        except Exception as e:
            # invalid config
            logger.warning(e)
            return Response(status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["patch"], url_path="update_symphony_object")
    def update_symphony_object(self, request):

        symphony_id = request.query_params.get("symphony_id")
        target_client.set_attr({
            "tag_list": request.data.get("tag_list", "[]"),
        })

        target_client.patch_config(name=symphony_id)
        return Response(target_client.get_object(symphony_id))

    @action(detail=False, methods=["delete"], url_path="delete_symphony_object")
    def delete_symphony_object(self, request):

        symphony_id = request.query_params.get("symphony_id")
        solution_symphony_id = target_client.get_solution_id(symphony_id)

        target_client.remove_config(name=symphony_id)
        if solution_symphony_id:
            solution_client.remove_config(name=solution_symphony_id)
        return Response(status=status.HTTP_204_NO_CONTENT)
