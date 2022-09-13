# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import logging
import json

from ..general.symphony_client import SymphonyClient


logger = logging.getLogger(__name__)


class SymphonyInstanceClient(SymphonyClient):

    def get_config(self):

        name = self.args.get("name", "")
        params = self.args.get("params", {})
        solution = self.args.get("solution", "")
        target = self.args.get("target", "")
        tag_list = self.args.get("tag_list", "")
        display_name = self.args.get("display_name", "")

        labels = {}
        if tag_list:
            for tag in json.loads(tag_list):
                labels[tag["name"]] = tag["value"]

        config_json = {
            "apiVersion": "solution.symphony/v1",
            "kind": "Instance",
            "metadata": {
                "name": name,
                "labels": labels
            },
            "spec": {
                "displayName": display_name,
                "parameters": params,
                "solution": solution,
                "target": {
                    "name": target
                }
            }
        }
        return config_json

    def get_patch_config(self):

        params = self.args.get("params", {})
        tag_list = self.args.get("tag_list", "")

        labels = {}
        if tag_list:
            for tag in json.loads(tag_list):
                labels[tag["name"]] = tag["value"]

        patch_config = [
            {'op': 'replace', 'path': '/metadata/labels', 'value': labels},
            {'op': 'replace', 'path': '/spec/parameters', 'value': params}
        ]
        return patch_config

    def get_config_from_symphony(self, name):

        api = self.get_client()

        if api:
            instance = api.get_namespaced_custom_object(
                group="solution.symphony",
                version="v1",
                namespace="default",
                plural="instances",
                name=name
            )
            return instance
        else:
            return ""

    def load_symphony_objects(self):
        from .models import Deployment
        from ..cameras.models import Camera
        from ..azure_cascades.models import Cascade
        from ..compute_devices.models import ComputeDevice

        api = self.get_client()
        if api:
            res = api.list_namespaced_custom_object(
                group="solution.symphony",
                version="v1",
                namespace="default",
                plural="instances"
            )
            instances = res['items']

            for instance in instances:
                name = instance['spec']['displayName']
                symphony_id = instance['metadata']['name']
                target_symphony_id = instance['spec']['target']['name']
                configure_data = json.loads(
                    instance['spec']['parameters']['configure_data'])

                target = ComputeDevice.objects.filter(
                    symphony_id=target_symphony_id).first()
                configure = []
                for cam in configure_data.keys():
                    cam_obj = Camera.objects.filter(name=cam).first()
                    cam_id = cam_obj.id if cam_obj else ""
                    cam_data = {
                        "camera": cam_id,
                        "skills": []
                    }
                    for skill in configure_data[cam]:
                        cascade_obj = Cascade.objects.filter(name=skill).first()
                        cascade_id = cascade_obj.id if cascade_obj else ""
                        cam_data["skills"].append({
                            "id": cascade_id,
                            "configured": "true"
                        })
                    configure.append(cam_data)

                deployment_obj, created = Deployment.objects.update_or_create(
                    name=name,
                    defaults={
                        "symphony_id": symphony_id,
                        "configure": json.dumps(configure),
                        "compute_device": target,
                    },
                )
                logger.info("Deployment: %s %s.", deployment_obj,
                            "created" if created else "updated")
        else:
            logger.warning("Not loading symphony skills")

    def get_status(self, name):

        api = self.get_client()

        if api:
            instance = api.get_namespaced_custom_object(
                group="solution.symphony",
                version="v1",
                namespace="default",
                plural="instances",
                name=name
            )
            status = instance.get("status", "")
            if status:
                return status['properties']
            else:
                return ""
        else:
            return ""
