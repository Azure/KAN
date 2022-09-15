# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import logging
import requests
import json
import uuid
import threading
import yaml

from django.db import models
from django.db.models.signals import post_save, post_delete, pre_save
from .symphony_client import SymphonyInstanceClient
from ..compute_devices.symphony_client import SymphonySolutionClient
from ..azure_app_insight.utils import get_app_insight_logger
from ..compute_devices.models import ComputeDevice
from ..cameras.models import Camera


logger = logging.getLogger(__name__)

# Create your models here.

instance_client = SymphonyInstanceClient()
solution_client = SymphonySolutionClient()


class Deployment(models.Model):
    name = models.CharField(max_length=200, null=True, blank=True, default="")
    compute_device = models.ForeignKey(
        ComputeDevice, on_delete=models.SET_NULL, null=True)
    configure = models.CharField(max_length=2000, null=True, blank=True, default="")
    tag_list = models.CharField(max_length=1000, null=True, blank=True, default="")
    symphony_id = models.CharField(max_length=200, null=True, blank=True, default="")
    status = models.CharField(max_length=1000, blank=True, default="")
    iothub_insights = models.CharField(max_length=100000, blank=True, default="[]")

    def __repr__(self):
        return self.name.__repr__()

    def __str__(self):
        return self.name.__str__()

    def get_status(self):
        status = instance_client.get_status(self.symphony_id)
        if status:
            return json.dumps(status)
        else:
            return ""

    def get_properties(self):
        prop = instance_client.get_config_from_symphony(self.symphony_id)
        if prop:
            return yaml.dump(prop)
        else:
            return ""

    @staticmethod
    def pre_save(**kwargs):
        instance = kwargs["instance"]

        if not instance.symphony_id:
            instance.symphony_id = 'instance-' + str(uuid.uuid4())

        logger.warning(f"instance symphony id: {instance.symphony_id}")

    @staticmethod
    def post_save(**kwargs):
        from ..azure_cascades.models import Cascade
        from ..azure_settings.models import Setting
        from .iothub_receive import receive_events_from_iothub

        # create both instance and solution
        """post_save."""
        instance = kwargs["instance"]
        created = kwargs["created"]

        if hasattr(instance, "skip_signals") and instance.skip_signals:
            return

        configure = json.loads(instance.configure)
        skill_env = []
        skill_params = {}
        # for recovering data from symphony -> {"camera_name": [skill_names]}
        configure_data = {}
        module_routes = []
        for cam in configure:
            device_obj = Camera.objects.get(pk=int(cam['camera']))
            configure_data[device_obj.name] = []
            for skill in cam['skills']:
                skill_obj = Cascade.objects.get(pk=int(skill['id']))
                skill_alias = str(uuid.uuid4())[-4:]
                skill_env.append(f"{skill_obj.symphony_id} as skill-{skill_alias}")
                skill_params[
                    f"skill-{skill_alias}.rtsp"] = f"rtsp://{device_obj.username}:{device_obj.password}@{device_obj.rtsp.split('rtsp://')[1]}"
                skill_params[f"skill-{skill_alias}.fps"] = skill_obj.fps
                skill_params[f"skill-{skill_alias}.device_id"] = device_obj.symphony_id
                skill_params[f"skill-{skill_alias}.instance_displayname"] = instance.name
                skill_params[f"skill-{skill_alias}.device_displayname"] = device_obj.name
                skill_params[f"skill-{skill_alias}.skill_displayname"] = skill_obj.name
                configure_data[device_obj.name].append(skill_obj.name)

                # check whether there is iotedge_export node and set route
                spec = json.loads(skill_obj.flow)
                for node in spec["nodes"]:
                    if node["type"] == "export" and node["name"] == "iotedge_export":
                        module_routes.append({
                            "module_name": node["configurations"]["module_name"],
                            "module_input": node["configurations"]["module_input"]
                        })
        skill_params["configure_data"] = json.dumps(configure_data)

        # update solution to the target
        solution_client.set_attr(
            {
                "name": instance.compute_device.solution_id,
                "display_name": instance.compute_device.solution_id + '-' + str(uuid.uuid4())[-4:],
                "skills": json.dumps(skill_env),
                "acceleration": instance.compute_device.acceleration,
                "architecture": instance.compute_device.architecture,
                "instance": instance.symphony_id,
                "iothub": instance.compute_device.iothub,
                "iotedge_device": instance.compute_device.iotedge_device,
                "module_routes": module_routes,
            }
        )

        # create/update instance
        instance_client.set_attr({
            "name": instance.symphony_id,
            "display_name": instance.name,
            "target": instance.compute_device.symphony_id,
            "solution": instance.compute_device.solution_id,
            "params": skill_params,
            "tag_list": instance.tag_list,
        })

        if created:
            # create
            solution_client.update_config(
                group="solution.symphony", plural="solutions", name=instance.compute_device.solution_id)
            instance_client.deploy_config(group="solution.symphony", plural="instances")
        else:
            # update
            solution_client.update_config(
                group="solution.symphony", plural="solutions", name=instance.compute_device.solution_id)
            instance_client.patch_config(
                group="solution.symphony", plural="instances", name=instance.symphony_id)

        # monitor iothub messages
        iothub = instance.compute_device.iothub
        setting_obj = Setting.objects.all().first()
        iothub_list = json.loads(setting_obj.monitored_iothubs)
        if iothub not in iothub_list:
            iothub_list.append(iothub)
            setting_obj.monitored_iothubs = json.dumps(iothub_list)
            setting_obj.save()
            threading.Thread(target=receive_events_from_iothub,
                             args=(iothub,), daemon=True).start()

            logger.warning(f"Start monitoring iothub: {iothub}")
        else:
            logger.warning(f"Iothub: {iothub} already being monitored")

        # sending info to app-insight
        az_logger = get_app_insight_logger()
        properties = {
            "custom_dimensions": {
                "create_deployment": json.dumps({
                    "name": instance.name,
                })
            }
        }
        az_logger.warning(
            "create_deployment",
            extra=properties,
        )

    @staticmethod
    def post_delete(**kwargs):
        instance = kwargs["instance"]
        instance_client.remove_config(
            group="solution.symphony", plural="instances", name=instance.symphony_id)


post_save.connect(Deployment.post_save, Deployment, dispatch_uid="Deployment_post")
pre_save.connect(Deployment.pre_save, Deployment, dispatch_uid="Deployment_pre")
post_delete.connect(Deployment.post_delete, Deployment,
                    dispatch_uid="Deployment_post_delete")
