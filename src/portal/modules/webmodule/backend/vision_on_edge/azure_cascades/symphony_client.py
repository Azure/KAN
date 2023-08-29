# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import logging
import json

from ..general.symphony_client import SymphonyClient


logger = logging.getLogger(__name__)


class SymphonySkillClient(SymphonyClient):

    def __init__(self):
        super().__init__()
        self.group = "ai.symphony"
        self.plural = "skills"
        self.symphony_api_url = "http://" + self.symphony_ip + ":8080/v1alpha2/skills"

    def get_config(self):

        name = self.args.get("name", "")
        tag_list = self.args.get("tag_list", "[]")
        spec = self.args.get("spec", "{}")

        labels = {}
        if tag_list:
            for tag in json.loads(tag_list):
                labels[tag["name"]] = tag["value"]

        config_json = {
            "apiVersion": "ai.symphony/v1",
            "kind": "Skill",
            "metadata": {
                "name": name,
                "labels": labels
            },
            "spec": spec
        }
        return config_json

    def get_patch_config(self):

        tag_list = self.args.get("tag_list", "[]")
        spec = self.args.get("spec", "{}")

        labels = {}
        if tag_list:
            for tag in json.loads(tag_list):
                labels[tag["name"]] = tag["value"]

        patch_config = [
            {'op': 'replace', 'path': '/metadata/labels', 'value': labels},
            # separate the columns to preserve the parameters
            {'op': 'replace', 'path': '/spec/edges', 'value': spec.get("edges", "[]")},
            {'op': 'replace', 'path': '/spec/nodes', 'value': spec.get("nodes", "[]")},
        ]
        return patch_config

    def load_symphony_objects(self):
        from .models import Cascade

        api = self.get_client()
        if api:
            res = api.list_namespaced_custom_object(
                group="ai.symphony",
                version="v1",
                namespace="default",
                plural="skills"
            )
            skills = res['items']

            for skill in skills:
                name = skill['spec']['displayName']
                symphony_id = skill['metadata']['name']
                spec = skill['spec']
                fps = skill['spec']['parameters'].get("fpsRetrieve", "")
                acceleration = skill['spec']['parameters'].get(
                    "accelerationRetrieve", "")

                skill_obj, created = Cascade.objects.update_or_create(
                    name=name,
                    defaults={
                        "symphony_id": symphony_id,
                        "flow": json.dumps(spec),
                        "fps": fps,
                        "acceleration": acceleration,
                    },
                )
                logger.info("Cascade: %s %s.", skill_obj,
                            "created" if created else "updated")
        else:
            logger.warning("Not loading symphony skills")

    def process_data(self, skill, multi):

        name = skill['spec']['displayName']
        symphony_id = skill['metadata']['name']
        spec = skill['spec']
        fps = skill['spec']['parameters'].get("fpsRetrieve", "")
        acceleration = skill['spec']['parameters'].get("accelerationRetrieve", "")
        labels = skill['metadata'].get('labels')
        if labels:
            tags = [{"name": k, "value": v} for k, v in labels.items()]
        else:
            tags = []
        tag_list = json.dumps(tags)

        return {
            "name": name,
            "symphony_id": symphony_id,
            "flow": spec,
            "acceleration": acceleration,
            "fps": fps,
            "tag_list": tag_list
        }
