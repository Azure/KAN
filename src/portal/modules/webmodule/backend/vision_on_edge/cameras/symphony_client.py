# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import logging
import json

from ..general.symphony_client import SymphonyClient
from ..general.utils import AzureBlobClient


logger = logging.getLogger(__name__)


class SymphonyDeviceClient(SymphonyClient):
    blob_client = None

    def __init__(self):
        super().__init__()
        self.blob_client = AzureBlobClient()

    def get_config(self):

        name = self.args.get("name", "")
        allowed_devices = self.args.get("allowed_devices", "")
        rtsp = self.args.get("rtsp", "")
        username = self.args.get("username", "")
        password = self.args.get("password", "")
        location = self.args.get("location", "")
        display_name = self.args.get("display_name", "")
        tag_list = self.args.get("tag_list", "")

        device_list = json.loads(allowed_devices)
        labels = {k: "true" for k in device_list}
        logger.warning(f"setting camera tags: {tag_list}")
        if tag_list:
            for tag in json.loads(tag_list):
                labels[tag["name"]] = tag["value"]

        config_json = {
            "apiVersion": "fabric.symphony/v1",
            "kind": "Device",
            "metadata": {
                "name": name,
                "labels": labels
            },
            "spec": {
                "properties": {
                    "ip": rtsp,
                    "user": username,
                    "password": password,
                    "location": location
                },
                "displayName": display_name
            },
        }
        return config_json

    def get_patch_config(self):

        allowed_devices = self.args.get("allowed_devices", "")
        rtsp = self.args.get("rtsp", "")
        username = self.args.get("username", "")
        password = self.args.get("password", "")
        location = self.args.get("location", "")
        tag_list = self.args.get("tag_list", "")

        device_list = json.loads(allowed_devices)
        labels = {k: "true" for k in device_list}
        logger.warning(f"setting camera tags: {tag_list}")
        if tag_list:
            for tag in json.loads(tag_list):
                labels[tag["name"]] = tag["value"]

        patch_config = [
            {'op': 'replace', 'path': '/metadata/labels', 'value': labels},
            {'op': 'replace', 'path': '/spec/properties/ip', 'value': rtsp},
            {'op': 'replace', 'path': '/spec/properties/user', 'value': username},
            {'op': 'replace', 'path': '/spec/properties/password', 'value': password},
            {'op': 'replace', 'path': '/spec/properties/location', 'value': location},
        ]
        return patch_config

    def get_snapshot_url(self, name):

        api = self.get_client()

        if api:
            device = api.get_namespaced_custom_object(
                group="fabric.symphony",
                version="v1",
                namespace="default",
                plural="devices",
                name=name
            )
            try:
                snapshot_url = device['status']['properties']['snapshot']
            except KeyError:
                snapshot_url = ""
            if snapshot_url:
                blob_sas = self.blob_client.generate_sas_token(name+'-snapshot.jpg')
                return f"{snapshot_url}?{blob_sas}"
        else:
            return ""

    def get_status(self, name):

        api = self.get_client()

        if api:
            device = api.get_namespaced_custom_object(
                group="fabric.symphony",
                version="v1",
                namespace="default",
                plural="devices",
                name=name
            )
            status = device.get("status", "")
            if status:
                return status['properties']
            else:
                return ""
        else:
            return ""

    def load_symphony_objects(self):
        from .models import Camera
        from ..azure_settings.models import Setting
        from ..locations.models import Location

        api = self.get_client()
        if api:
            res = api.list_namespaced_custom_object(
                group="fabric.symphony",
                version="v1",
                namespace="default",
                plural="devices"
            )
            devices = res['items']

            for device in devices:
                name = device['spec']['displayName']
                symphony_id = device['metadata']['name']
                rtsp = device['spec']['properties'].get('ip', "")
                username = device['spec']['properties'].get('user', "")
                password = device['spec']['properties'].get('password', "")
                location = device['spec']['properties'].get('location', "")
                if location:
                    location_obj, created = Location.objects.get_or_create(
                        name=location)
                else:
                    location_obj = None
                labels = device['metadata'].get('labels')
                if labels:
                    device_list = [k for k, v in labels.items() if v == "true"]
                    tags = [{"name": k, "value": v} for k, v in labels.items()]
                else:
                    device_list = []
                    tags = []
                allowed_devices = json.dumps(device_list)
                tag_list = json.dumps(tags)

                cam_obj, created = Camera.objects.update_or_create(
                    name=name,
                    is_demo=False,
                    defaults={
                        "rtsp": rtsp,
                        "username": username,
                        "password": password,
                        "area": "",
                        "lines": "",
                        "location": location_obj,
                        "allowed_devices": allowed_devices,
                        "symphony_id": symphony_id,
                        "tag_list": tag_list,
                    },
                )
                logger.info("Camera: %s %s.", cam_obj,
                            "created" if created else "updated")
        else:
            logger.warning("Not loading symphony devices")
