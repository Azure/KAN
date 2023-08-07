# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import logging
import json

from ..general.kan_client import KanClient


logger = logging.getLogger(__name__)


class KanInstanceClient(KanClient):

    def __init__(self):
        super().__init__()
        self.group = "solution.kan"
        self.plural = "instances"
        self.kan_api_url = "http://" + self.kan_ip + ":8080/v1alpha2/instances"

    def get_config(self):

        name = self.args.get("name", "")
        params = self.args.get("params", {})
        pipelines = self.args.get("pipelines", {})
        solution = self.args.get("solution", "")
        target = self.args.get("target", "")
        tag_list = self.args.get("tag_list", "[]")
        display_name = self.args.get("display_name", "")

        labels = {}
        if tag_list:
            for tag in json.loads(tag_list):
                labels[tag["name"]] = tag["value"]

        config_json = {
            "apiVersion": "solution.kan/v1",
            "kind": "Instance",
            "metadata": {
                "name": name,
                "labels": labels
            },
            "spec": {
                "scope": "poss",
                "displayName": display_name,
                "pipelines": pipelines,
                "parameters": params,
                "solution": solution,
                "target": {
                    "name": target
                }
            }
        }
        return config_json

    def get_patch_config(self):

        pipelines = self.args.get("pipelines", {})
        params = self.args.get("params", {})
        tag_list = self.args.get("tag_list", "[]")

        labels = {}
        if tag_list:
            for tag in json.loads(tag_list):
                labels[tag["name"]] = tag["value"]

        patch_config = [
            {'op': 'replace', 'path': '/metadata/labels', 'value': labels},
            {'op': 'replace', 'path': '/spec/pipelines', 'value': pipelines},
            {'op': 'replace', 'path': '/spec/parameters', 'value': params}
        ]
        return patch_config

    def load_kan_objects(self):
        from .models import Deployment
        from ..cameras.models import Camera
        from ..azure_cascades.models import Cascade
        from ..compute_devices.models import ComputeDevice

        api = self.get_client()
        if api:
            res = api.list_namespaced_custom_object(
                group="solution.kan",
                version="v1",
                namespace="default",
                plural="instances"
            )
            instances = res['items']

            for instance in instances:
                name = instance['spec']['displayName']
                kan_id = instance['metadata']['name']
                target_kan_id = instance['spec']['target']['name']
                configure_data = json.loads(
                    instance['spec']['parameters']['configure_data'])

                target = ComputeDevice.objects.filter(
                    kan_id=target_kan_id).first()
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
                        "kan_id": kan_id,
                        "configure": json.dumps(configure),
                        "compute_device": target,
                    },
                )
                logger.info("Deployment: %s %s.", deployment_obj,
                            "created" if created else "updated")
        else:
            logger.warning("Not loading kan skills")

    def process_data(self, instance, multi):

        name = instance['spec']['displayName']
        kan_id = instance['metadata']['name']
        configure_data = json.loads(instance['spec']['parameters']['configure_data'])
        target_kan_id = instance['spec']['target']['name']

        labels = instance['metadata'].get('labels')
        if labels:
            tags = [{"name": k, "value": v} for k, v in labels.items()]
        else:
            tags = []
        tag_list = json.dumps(tags)

        configure = []
        for cam in configure_data.keys():
            cam_data = {
                "camera": cam,
                "skills": []
            }
            for skill in configure_data[cam]:
                cam_data["skills"].append({
                    "id": skill,
                    "configured": "true"
                })
            configure.append(cam_data)

        # status
        status = instance.get("status", "")
        if status:
            processed_status = self.process_status(status['properties'])
        else:
            processed_status = ""

        return {
            "name": name,
            "kan_id": kan_id,
            "configure": json.dumps(configure),
            "compute_device": target_kan_id,
            "status": processed_status,
            "tag_list": tag_list
        }

    def process_status(self, status):
        return json.dumps(status)

    def get_status(self, name):

        api = self.get_client()

        if api:
            instance = api.get_namespaced_custom_object(
                group="solution.kan",
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
