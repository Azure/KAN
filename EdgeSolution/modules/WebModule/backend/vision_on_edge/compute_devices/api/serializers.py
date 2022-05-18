"""App API serializers.
"""

import logging

from rest_framework import serializers

from ..models import ComputeDevice

logger = logging.getLogger(__name__)


class ComputeDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComputeDevice
        fields = "__all__"
