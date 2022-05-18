"""App API views.
"""

import logging

from rest_framework import viewsets
from rest_framework.response import Response

from ..models import ComputeDevice
from .serializers import ComputeDeviceSerializer

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
