# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""App serializers.
"""

import logging

from drf_extra_fields.fields import Base64ImageField
from rest_framework import serializers
from ..models import Deployment


logger = logging.getLogger(__name__)


class DeploymentSerializer(serializers.ModelSerializer):
    '''Deployment serializer
    '''
    class Meta:
        model = Deployment
        fields = "__all__"


class UploadRelabelSerializer(serializers.Serializer):
    """UploadRelabelSerializer."""
    project_symphony_id = serializers.CharField()
    part_name = serializers.CharField()
    labels = serializers.CharField()
    img = Base64ImageField(required=True)
    confidence = serializers.FloatField()
    max_images = serializers.IntegerField()
