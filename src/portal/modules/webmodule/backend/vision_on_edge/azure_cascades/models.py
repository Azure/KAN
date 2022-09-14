# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import logging
import requests
import json
import uuid
import yaml

from django.db import models
from django.db.models.signals import post_save, post_delete, pre_save
from .symphony_client import SymphonySkillClient
from ..compute_devices.symphony_client import SymphonySolutionClient
from ..azure_iot.utils import model_manager_module_url
from ..azure_app_insight.utils import get_app_insight_logger

logger = logging.getLogger(__name__)

# Create your models here.

skill_client = SymphonySkillClient()
solution_client = SymphonySolutionClient()


class Cascade(models.Model):
    name = models.CharField(max_length=200, null=True, blank=True, default="")
    flow = models.CharField(max_length=1000000, null=True, blank=True, default="")
    raw_data = models.CharField(max_length=1000000, null=True, blank=True, default="")

    screenshot = models.CharField(max_length=1000000, null=True, blank=True, default="")
    tag_list = models.CharField(max_length=1000, null=True, blank=True, default="")
    symphony_id = models.CharField(max_length=200, null=True, blank=True, default="")
    fps = models.CharField(max_length=200, null=True, blank=True, default="")
    acceleration = models.CharField(max_length=200, null=True, blank=True, default="")

    def __repr__(self):
        return self.name.__repr__()

    def __str__(self):
        return self.name.__str__()

    # automatically modify single model cascade

    def get_properties(self):
        prop = skill_client.get_config_from_symphony(self.symphony_id)
        if prop:
            return yaml.dump(prop)
        else:
            return ""

    @staticmethod
    def pre_save(**kwargs):
        instance = kwargs["instance"]

        if not instance.symphony_id:
            instance.symphony_id = 'skill-' + str(uuid.uuid4())

        logger.warning(f"cascade symphony id: {instance.symphony_id}")

    @staticmethod
    def post_create(**kwargs):
        """post_save."""
        from ..deployments.models import Deployment

        instance = kwargs["instance"]
        created = kwargs["created"]

        if hasattr(instance, "skip_signals") and instance.skip_signals:
            return

        flow = json.loads(instance.flow)
        flow["displayName"] = instance.name
        flow["parameters"]["fpsRetrieve"] = instance.fps
        flow["parameters"]["accelerationRetrieve"] = instance.acceleration
        skill_client.set_attr({
            "name": instance.symphony_id,
            "spec": flow,
            "tag_list": instance.tag_list,
        })

        if created:
            # create
            skill_client.deploy_config(group="ai.symphony", plural="skills")
        else:
            # update
            # get affected solution: deployment -> target -> solution
            affected_solutions = []
            for instance_obj in Deployment.objects.all():
                configure = json.loads(instance_obj.configure)
                for cam in configure:
                    for skill in cam['skills']:
                        if int(skill['id']) == int(instance.id):
                            affected_solutions.append(
                                instance_obj.compute_device.solution_id)

            skill_client.patch_config(
                group="ai.symphony", plural="skills", name=instance.symphony_id)

            logger.warning(f"Updating affected solutions: {affected_solutions}")
            for solution_id in affected_solutions:
                solution_client.touch_config(solution_id)

        # sending info to app-insight
        az_logger = get_app_insight_logger()
        properties = {
            "custom_dimensions": {
                "create_cascade": json.dumps({
                    "name": instance.name,
                })
            }
        }
        az_logger.warning(
            "create_cascade",
            extra=properties,
        )

    @staticmethod
    def post_delete(**kwargs):
        instance = kwargs["instance"]
        skill_client.remove_config(
            group="ai.symphony", plural="skills", name=instance.symphony_id)


post_save.connect(Cascade.post_create, Cascade, dispatch_uid="Cascade_post")
pre_save.connect(Cascade.pre_save, Cascade, dispatch_uid="Cascade_pre")
post_delete.connect(Cascade.post_delete, Cascade, dispatch_uid="Cascade_post_delete")
