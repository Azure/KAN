# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""App models.
"""

import logging
import json
import uuid
import yaml

from django.db import models
from django.db.models.signals import post_save, post_delete, pre_save

from .symphony_client import SymphonyTargetClient, SymphonySolutionClient
from ..azure_app_insight.utils import get_app_insight_logger

logger = logging.getLogger(__name__)


target_client = SymphonyTargetClient()
solution_client = SymphonySolutionClient()


class ComputeDevice(models.Model):
    """ComputeDevice Model."""

    name = models.CharField(max_length=1000, null=True, blank=True, default="")
    iothub = models.CharField(max_length=1000, null=True, blank=True, default="")
    iotedge_device = models.CharField(
        max_length=1000, null=True, blank=True, default="")
    architecture = models.CharField(max_length=1000, null=True, blank=True, default="")
    acceleration = models.CharField(max_length=1000, null=True, blank=True, default="")
    tag_list = models.CharField(max_length=1000, null=True, blank=True, default="")
    symphony_id = models.CharField(max_length=1000, null=True, blank=True, default="")
    solution_id = models.CharField(max_length=1000, null=True, blank=True, default="")
    status = models.CharField(max_length=1000, blank=True, default="")
    is_k8s = models.BooleanField(default=False)
    cluster_type = models.CharField(
        max_length=1000, null=True, blank=True, default="current")

    def get_status(self):
        from ..cameras.models import Camera
        camera_table = {i.symphony_id: i.name for i in Camera.objects.all()}
        status_table = {}
        status = target_client.get_status(self.symphony_id)
        if status:
            for key in status.keys():
                cam = key.split('.')[0]
                if cam and cam in camera_table.keys():
                    if status[key] == "connected":
                        status_table[camera_table[cam]] = "connected"
                    else:
                        if cam not in status_table.keys():
                            status_table[camera_table[cam]] = "disconnected"

            return json.dumps(status_table)
        else:
            return ""

    def get_properties(self):
        prop = target_client.get_config_from_symphony(self.symphony_id)
        if prop:
            return yaml.dump(prop)
        else:
            return ""

    @staticmethod
    def pre_save(**kwargs):
        """pre_save."""
        instance = kwargs["instance"]

        if not instance.symphony_id:
            instance.symphony_id = 'target-' + str(uuid.uuid4())
            instance.solution_id = 'solution-' + str(uuid.uuid4())

    @staticmethod
    def post_save(**kwargs):
        """post_save."""
        instance = kwargs["instance"]
        created = kwargs["created"]

        if hasattr(instance, "skip_signals") and instance.skip_signals:
            return

        attrs = {
            "name": instance.symphony_id,
            "iothub": instance.iothub,
            "iotedge_device": instance.iotedge_device,
            "architecture": instance.architecture,
            "acceleration": instance.acceleration,
            "display_name": instance.name,
            "solution_id": instance.solution_id,
            "tag_list": instance.tag_list,
            "is_k8s": instance.is_k8s,
            "cluster_type": instance.cluster_type
        }
        target_client.set_attr(attrs)
        solution_client.set_attr({
            "name": instance.solution_id,
            "acceleration": instance.acceleration,
            "iothub": instance.iothub,
            "iotedge_device": instance.iotedge_device,
            "is_k8s": instance.is_k8s,
        })

        az_logger = get_app_insight_logger()
        properties = {
            "custom_dimensions": {
                "create_compute_device": json.dumps(attrs)
            }
        }
        if created:
            # create
            target_client.deploy_config()
            solution_client.deploy_config()
        else:
            # update
            target_client.patch_config(name=instance.symphony_id)
        az_logger.warning(
            "create_compute_device",
            extra=properties,
        )

    @staticmethod
    def post_delete(**kwargs):
        instance = kwargs["instance"]
        target_client.remove_config(name=instance.symphony_id)
        solution_client.remove_config(name=instance.solution_id)


pre_save.connect(ComputeDevice.pre_save, ComputeDevice,
                 dispatch_uid="Compute_device_pre")
post_save.connect(ComputeDevice.post_save, ComputeDevice,
                  dispatch_uid="Compute_device_post")
post_delete.connect(ComputeDevice.post_delete, ComputeDevice,
                    dispatch_uid="Compute_device_delete")
