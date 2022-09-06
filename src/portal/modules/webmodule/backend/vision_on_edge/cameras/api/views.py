# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""App API views.
"""

from __future__ import absolute_import, unicode_literals

import logging

from filters.mixins import FiltersMixin
from rest_framework import filters, viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError

from ..models import Camera
from .serializers import CameraSerializer
from ...general.shortcuts import drf_get_object_or_404

logger = logging.getLogger(__name__)


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

    def get_queryset(self):
        queryset = Camera.objects.all()
        for camera_obj in queryset:
            camera_obj.snapshot = camera_obj.get_snapshot_url()
            camera_obj.skip_signals = True  # only update column, skip symphony api
            camera_obj.save()
        return queryset

    @action(detail=False, methods=["delete"], url_path="bulk-delete")
    def bulk_delete(self, request):
        logger.warning(request)
        logger.warning(request.query_params)
        ids = request.query_params.getlist('id', None)
        if not ids:
            raise ValidationError("Not providing ids data")
        # this would not trigger pre/post delete, get instance and delete if needed
        Camera.objects.filter(id__in=ids).all().delete()
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
