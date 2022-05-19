"""App models.
"""

import logging
import json

from django.db import models
from django.db.models.signals import pre_save, post_delete

from kubernetes import client, config

from ..locations.models import Location
from .constants import gen_default_lines, gen_default_zones
from .exceptions import CameraRtspInvalid
from .utils import verify_rtsp
from ..azure_app_insight.utils import get_app_insight_logger

logger = logging.getLogger(__name__)


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
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True)
    media_type = models.CharField(max_length=1000, blank=True)

    def tasks(self):
        try:
            return self.cameratasks.all()
        except Exception:
            return []
    
    def get_client(self):
        try:
            config.load_incluster_config()
            api = client.CustomObjectsApi() 
        except:
            logger.warning("Cannot load k8s config")
            api = None
            
        return api
    def deploy_config(self):
        resource_json = {
            "apiVersion": "fabric.symphony/v1", 
            "kind": "Device", 
            "metadata": {"name": self.name}, 
            "spec": {
                "bindings": [
                    {
                        "role": "r1", 
                        "type": "t1", 
                        "parameters": {
                            "rtsp": self.rtsp,
                            "name": self.name, 
                            "location": self.location.name}
                    }
                ]
            },
        }
        api_instance = self.get_client()
        if api_instance:
            api_instance.create_namespaced_custom_object( 
                group="fabric.symphony", 
                version="v1", 
                namespace="voe", 
                plural="devices", 
                body=resource_json, 
            )
        else:
            logger.warning("not deployed")
    
    def remove_config(self):
        api_instance = self.get_client()
        if api_instance:
            api_instance.delete_namespaced_custom_object( 
                group="fabric.symphony", 
                version="v1", 
                namespace="voe", 
                plural="devices", 
                name=self.name, 
            )
        else:
            logger.warning("not removed")

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
        if not verify_rtsp(rtsp=instance.rtsp):
            raise CameraRtspInvalid
        az_logger = get_app_insight_logger()
        properties = {
            "custom_dimensions": {
                "create_camera": json.dumps({
                    "name": instance.name,
                    "rtsp_url": instance.rtsp,
                    "location": instance.location.name,
                })
            }
        }
        instance.deploy_config()
        az_logger.warning(
            "create_camera",
            extra=properties,
        )

    @staticmethod
    def post_delete(**kwargs):
        instance = kwargs["instance"]
        instance.remove_config()


pre_save.connect(Camera.pre_save, Camera, dispatch_uid="Camera_pre")
post_delete.connect(Camera.post_delete, Camera, dispatch_uid="Camera_post_delete")
