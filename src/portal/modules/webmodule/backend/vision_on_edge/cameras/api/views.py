# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""App API views.
"""

from __future__ import absolute_import, unicode_literals

import logging
import uuid
import yaml

from filters.mixins import FiltersMixin
from rest_framework import filters, viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError

from ..models import Camera
from ..utils import verify_rtsp
from ...locations.models import Location
from ..symphony_client import SymphonyDeviceClient
from .serializers import CameraSerializer
from ...general.shortcuts import drf_get_object_or_404

logger = logging.getLogger(__name__)

device_client = SymphonyDeviceClient()


# pylint: disable=too-many-ancestors
class CameraViewSet(FiltersMixin, viewsets.ModelViewSet):
    """
    Camera ModelViewSet

    Available filters:
    @is_demo
    """

    queryset = Camera.objects.all()
    serializer_class = CameraSerializer
    filter_backends = (filters.OrderingFilter,)
    filter_mappings = {
        "is_demo": "is_demo",
    }

    # def get_queryset(self):
    #     queryset = Camera.objects.all()
    #     for camera_obj in queryset:
    #         camera_obj.snapshot = camera_obj.get_snapshot_url()
    #         camera_obj.skip_signals = True  # only update column, skip symphony api
    #         camera_obj.save()
    #     return queryset

    @action(detail=False, methods=["delete"], url_path="bulk-delete")
    def bulk_delete(self, request):
        logger.warning(request)
        logger.warning(request.query_params)
        ids = request.query_params.getlist('id', None)
        if not ids:
            raise ValidationError("Not providing ids data")
        # this would not trigger pre/post delete, get instance and delete if needed
        # Camera.objects.filter(id__in=ids).all().delete()
        for symphony_id in ids:
            device_client.remove_config(name=symphony_id)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["get"], url_path="update_status")
    def update_status(self, request, pk=None):
        queryset = self.get_queryset()
        camera_obj = drf_get_object_or_404(queryset, pk=pk)
        camera_obj.status = camera_obj.get_status()
        camera_obj.skip_signals = True  # only update column, skip symphony api
        camera_obj.save()

        serializer = CameraSerializer(camera_obj)

        logger.warning('Retrieving device status')

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="get_properties")
    def get_properties(self, request, pk=None):

        symphony_id = request.query_params.get("symphony_id")

        logger.warning(f"Retrieving device [{symphony_id}] config.")

        return Response(yaml.dump(device_client.get_config_from_symphony(symphony_id)))

    @action(detail=False, methods=["get"], url_path="get_symphony_objects")
    def get_symphony_objects(self, request):

        symphony_id = request.query_params.get("symphony_id")
        logger.warning(f"Retrieving all devices config.")
        return Response(device_client.get_objects())

    @action(detail=False, methods=["get"], url_path="get_symphony_object")
    def get_symphony_object(self, request):

        symphony_id = request.query_params.get("symphony_id")

        if symphony_id:
            logger.warning(f"Retrieving device [{symphony_id}] config.")
            device = device_client.get_object(symphony_id)
            if device:
                device["is_live"] = verify_rtsp(rtsp=device["rtsp"])

            return Response(device)
        else:
            raise ValidationError("Not providing symphony_id")

    @action(detail=False, methods=["post"], url_path="create_symphony_object")
    def create_symphony_object(self, request):

        symphony_id = 'device-' + str(uuid.uuid4())

        device_client.set_attr({
            "name": symphony_id,
            "rtsp": request.data.get("rtsp", ""),
            "username": request.data.get("username", ""),
            "password": request.data.get("password", ""),
            "location": request.data.get("location", ""),
            "allowed_devices": request.data.get("allowed_devices", "[]"),
            "display_name": request.data.get("name", ""),
            "tag_list": request.data.get("tag_list", "[]"),
        })

        device_client.deploy_config()
        return Response(device_client.get_object(symphony_id))

    @action(detail=False, methods=["patch"], url_path="update_symphony_object")
    def update_symphony_object(self, request):

        symphony_id = request.query_params.get("symphony_id")
        # location_obj = Location.objects.get(name=request.data.get("location"))
        device_client.set_attr({
            "username": request.data.get("username", ""),
            "password": request.data.get("password", ""),
            "location": request.data.get("location", ""),
            "allowed_devices": request.data.get("allowed_devices", "[]"),
            "tag_list": request.data.get("tag_list", "[]"),
        })

        device_client.patch_config(name=symphony_id)
        return Response(device_client.get_object(symphony_id))

    @action(detail=False, methods=["delete"], url_path="delete_symphony_object")
    def delete_symphony_object(self, request):

        symphony_id = request.query_params.get("symphony_id")

        device_client.remove_config(name=symphony_id)
        return Response(status=status.HTTP_204_NO_CONTENT)
