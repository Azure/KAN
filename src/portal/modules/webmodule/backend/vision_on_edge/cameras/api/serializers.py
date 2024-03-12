# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""App API serializers.
"""

import logging

from rest_framework import serializers

from ..models import Camera
from ..utils import upload_media_source

logger = logging.getLogger(__name__)


class CameraSerializer(serializers.ModelSerializer):
    """CameraSerializer."""

    media_source = serializers.CharField(
        max_length=1000, write_only=True, required=False
    )

    class Meta:
        model = Camera
        fields = [
            "id",
            "name",
            "rtsp",
            "username",
            "password",
            "area",
            "lines",
            "danger_zones",
            "is_demo",
            "location",
            "media_type",
            "media_source",
            "allowed_devices",
            "tag_list",
            "snapshot",
            "is_live",
            "symphony_id",
            "status",
        ]
        extra_kwargs = {"media_source": {"write_only": True, "required": False}}

    def create(self, validated_data):
        logger.info("serialzer create. Validated data %s", validated_data)
        camera = Camera(
            name=validated_data["name"],
            location=validated_data["location"],
            tag_list=validated_data["tag_list"],
            username=validated_data["username"],
            password=validated_data["password"],
            allowed_devices=validated_data["allowed_devices"],
        )
        for attr in ["area", "lines", "danger_zones", "is_demo", "media_type"]:
            if attr in validated_data:
                setattr(camera, attr, validated_data[attr])
        if "media_source" in validated_data:
            logger.info("Get video source %s", validated_data["media_source"])
            rtsp = upload_media_source(media_source=validated_data["media_source"])
            logger.info("uploaded rtsp is %s", rtsp)
            camera.rtsp = rtsp
        else:
            camera.rtsp = validated_data["rtsp"]

        camera.save()
        return camera
