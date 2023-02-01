# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""App models.
"""

import logging
import json
import uuid
import yaml

from django.db import models
from django.db.models.signals import pre_save, post_delete, post_save

from kubernetes import client, config

from ..locations.models import Location
from .constants import gen_default_lines, gen_default_zones
from .exceptions import CameraRtspInvalid
from .utils import verify_rtsp
from ..azure_app_insight.utils import get_app_insight_logger
from.kan_client import KanDeviceClient

logger = logging.getLogger(__name__)

device_client = KanDeviceClient()


class Camera(models.Model):
    """Camera Model."""

    name = models.CharField(max_length=200)
    rtsp = models.CharField(max_length=1000, blank=True)
    area = models.CharField(max_length=1000, blank=True)
    lines = models.CharField(max_length=1000, blank=True, default=gen_default_lines)
    danger_zones = models.CharField(
        max_length=1000, blank=True, default=gen_default_zones
    )
    is_demo = models.BooleanField(default=False)
    is_live = models.BooleanField(default=True)
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True)
    media_type = models.CharField(max_length=1000, blank=True)
    tag_list = models.CharField(max_length=1000, null=True, blank=True, default="")
    username = models.CharField(max_length=200, blank=True, default="")
    password = models.CharField(max_length=200, blank=True, default="")
    allowed_devices = models.CharField(max_length=1000, blank=True, default="[]")
    kan_id = models.CharField(max_length=200, blank=True, default="")
    snapshot = models.CharField(max_length=1000, blank=True, default="", null=True)
    status = models.CharField(max_length=1000, blank=True, default="")

    def tasks(self):
        try:
            return self.cameratasks.all()
        except Exception:
            return []

    def get_snapshot_url(self):
        return device_client.get_snapshot_url(self.kan_id)

    def get_status(self):
        from ..compute_devices.models import ComputeDevice
        compute_device_table = {
            i.kan_id: i.name for i in ComputeDevice.objects.all()}
        status_table = {}
        status = device_client.get_status(self.kan_id)
        if status:
            for key in status.keys():
                compute_device = key.split('.')[0]
                if compute_device in compute_device_table.keys():
                    if status[key] == "connected":
                        status_table[compute_device_table[compute_device]] = "connected"
                    else:
                        if compute_device not in status_table.keys():
                            status_table[compute_device_table[compute_device]
                                         ] = "disconnected"

            return json.dumps(status_table)
        else:
            return ""

    def get_properties(self):
        prop = device_client.get_config_from_kan(self.kan_id)
        if prop:
            return yaml.dump(prop)
        else:
            return ""

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name.__repr__()

    @staticmethod
    def pre_save(**kwargs):
        """pre_save."""
        instance = kwargs["instance"]
        if hasattr(instance, "skip_signals") and instance.skip_signals:
            return
        if instance.is_demo:
            return
        if instance.rtsp is None:
            raise CameraRtspInvalid
        rtsp = f"rtsp://{instance.username}:{instance.password}@{instance.rtsp.split('rtsp://')[1]}"
        if not verify_rtsp(rtsp=rtsp):
            instance.is_live = False

        if not instance.kan_id:
            instance.kan_id = 'device-' + str(uuid.uuid4())

        # az_logger = get_app_insight_logger()
        # properties = {
        #     "custom_dimensions": {
        #         "create_camera": json.dumps({
        #             "name": instance.name,
        #             "rtsp_url": instance.rtsp,
        #             "location": instance.location.name if instance.location else "",
        #         })
        #     }
        # }
        # az_logger.warning(
        #     "create_camera",
        #     extra=properties,
        # )

    @staticmethod
    def post_save(**kwargs):
        instance = kwargs["instance"]
        created = kwargs["created"]

        if hasattr(instance, "skip_signals") and instance.skip_signals:
            return

        device_client.set_attr(
            {
                "name": instance.kan_id,
                "rtsp": instance.rtsp,
                "username": instance.username,
                "password": instance.password,
                "location": instance.location.name,
                "allowed_devices": instance.allowed_devices,
                "display_name": instance.name,
                "tag_list": instance.tag_list,
            }
        )

        if created:
            # create
            device_client.deploy_config()
        else:
            # update
            device_client.patch_config(name=instance.kan_id)

    @staticmethod
    def post_delete(**kwargs):
        instance = kwargs["instance"]
        device_client.remove_config(name=instance.kan_id)


pre_save.connect(Camera.pre_save, Camera, dispatch_uid="Camera_pre")
post_save.connect(Camera.post_save, Camera, dispatch_uid="Camera_post")
post_delete.connect(Camera.post_delete, Camera, dispatch_uid="Camera_post_delete")
