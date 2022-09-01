# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""App API views.
"""

import logging

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError

from ..models import ComputeDevice
from .serializers import ComputeDeviceSerializer
from ..utils import list_iothub, list_devices

logger = logging.getLogger(__name__)


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

    def get_object(self):
        compute_device_obj = super().get_object()
        compute_device_obj.status = compute_device_obj.get_status()
        compute_device_obj.skip_signals = True  # only update column, skip symphony api
        compute_device_obj.save()
        return compute_device_obj

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
        ComputeDevice.objects.filter(id__in=ids).all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
