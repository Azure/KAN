# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import logging
import os
import json
import subprocess

from ..general.symphony_client import SymphonyClient


logger = logging.getLogger(__name__)


class SymphonyTargetClient(SymphonyClient):

    def get_config(self):
        name = self.args.get("name", "")
        iothub = self.args.get("iothub", "")
        iotedge_device = self.args.get("iotedge_device", "")
        architecture = self.args.get("architecture", "")
        acceleration = self.args.get("acceleration", "")
        display_name = self.args.get("display_name", "")
        solution_id = self.args.get("solution_id", "")
        tag_list = self.args.get("tag_list", "")
        is_k8s = self.args.get("is_k8s", False)
        cluster_type = self.args.get("cluster_type", "current")
        # connection_str = os.getenv('IOTHUB_CONNECTION_STRING')
        tenant_id = os.getenv('TENANT_ID')
        client_id = os.getenv('CLIENT_ID')
        client_secret = os.getenv('CLIENT_SECRET')
        storage_account = os.getenv('STORAGE_ACCOUNT')
        storage_container = os.getenv('STORAGE_CONTAINER')
        # symphony_url = os.getenv('SYMPHONY_URL')
        symphony_agent_version = os.getenv('SYMPHONY_AGENT_VERSION')

        service_api = self.get_service_client()
        res = service_api.read_namespaced_service(
            name='symphony-service-ext', namespace='symphony-k8s-system')
        symphony_ip = res.status.load_balancer.ingress[0].ip
        symphony_url = "http://" + symphony_ip + ":8080/v1alpha2/agent/references"

        labels = {}
        if tag_list:
            for tag in json.loads(tag_list):
                labels[tag["name"]] = tag["value"]

        if is_k8s:
            provider = "providers.target.k8s"
            if cluster_type == "current":
                config = {"inCluster": 'true'}
            else:
                # TODO to be modified to provided config
                config = {"inCluster": 'false'}
        else:
            # get iothub connection string
            res = subprocess.check_output(
                ['az', 'iot', 'hub', 'connection-string', 'show', '--hub-name', iothub, '-o', 'tsv'])
            connection_str = res.decode('utf8').strip()

            iot_info = {}
            for kv in connection_str.split(';'):
                key = kv.split('=')[0]
                val = kv[len(key)+1:]
                iot_info[key] = val

            provider = "providers.target.azure.iotedge"
            config = {
                "name": "iot-edge",
                "keyName": iot_info['SharedAccessKeyName'] if iot_info else None,
                "key": iot_info["SharedAccessKey"] if iot_info else None,
                "iotHub": iot_info["HostName"] if iot_info else None,
                "apiVersion": "2020-05-31-preview",
                "deviceName": str(iotedge_device),
            }

        config_json = {
            "apiVersion": "fabric.symphony/v1",
            "kind": "Target",
            "metadata": {
                "name": name,
                "labels": labels
            },
            "spec": {
                "name": name,
                "displayName": display_name,
                "metadata": {
                    "deployment.replicas": "#1",
                    "service.ports": "JA.[{\"name\":\"port8088\",\"port\": 8088}]",
                    "service.type": "ClusterIP",
                    "service.name": "symphony-agent"
                },
                "components": [
                    {
                        "name": "symphony-agent",
                        "properties": {
                            "container.version": "1.0",
                            "container.type": "docker",
                            "container.image": "possprod.azurecr.io/symphony-agent:"+symphony_agent_version,
                            "container.createOptions": "{\"HostConfig\":{\"Binds\":[\"/etc/iotedge/storage:/snapshots\"],\"LogConfig\":{\"Type\":\"json-file\",\"Config\":{\"max-size\":\"10m\",\"max-file\":\"10\"}}}}",
                            "container.restartPolicy": "always",
                            "env.AZURE_CLIENT_ID": client_id,
                            "env.AZURE_TENANT_ID": tenant_id,
                            "env.AZURE_CLIENT_SECRET": client_secret,
                            "env.STORAGE_ACCOUNT": storage_account,
                            "env.STORAGE_CONTAINER": storage_container,
                            "env.SYMPHONY_URL": symphony_url,
                            "env.TARGET_NAME": name,
                            "env.SNAPSHOT_ROOT": "/snapshots"
                        }
                    }
                ],
                "topologies": [
                    {
                        "bindings": [
                            {
                                "role": "instance",
                                "provider": provider,
                                "config": config
                            }
                        ]
                    }
                ],
                "properties": {
                    "cpu": str(architecture),
                    "acceleration": str(acceleration),
                    "os": "Ubuntu 20.04",
                    "solutionId": solution_id
                }
            },
        }
        return config_json

    def get_patch_config(self):

        tag_list = self.args.get("tag_list", "")

        labels = {}
        if tag_list:
            for tag in json.loads(tag_list):
                labels[tag["name"]] = tag["value"]

        # can only patch labels on portal for now
        patch_config = [
            {'op': 'replace', 'path': '/metadata/labels', 'value': labels},
        ]
        return patch_config

    def get_config_from_symphony(self, name):

        api = self.get_client()

        if api:
            instance = api.get_namespaced_custom_object(
                group="fabric.symphony",
                version="v1",
                namespace="default",
                plural="targets",
                name=name
            )
            return instance
        else:
            return ""

    def load_symphony_objects(self):
        from .models import ComputeDevice

        api = self.get_client()
        if api:
            res = api.list_namespaced_custom_object(
                group="fabric.symphony",
                version="v1",
                namespace="default",
                plural="targets"
            )
            targets = res['items']

            for target in targets:
                name = target['spec']['displayName']
                symphony_id = target['metadata']['name']
                iothub = target['spec']['topologies'][0]['bindings'][0]['config'].get('iotHub', "").split('.')[
                    0]
                iotedge_device = target['spec']['topologies'][0]['bindings'][0]['config'].get(
                    'deviceName', "")
                architecture = target['spec'].get("properties", {}).get('cpu', "")
                acceleration = target['spec'].get(
                    "properties", {}).get('acceleration', "")
                solution_id = target['spec'].get("properties", {}).get('solutionId', "")

                is_k8s = "k8s" in target['spec']['topologies'][0]['bindings'][0]["provider"]
                if is_k8s:
                    if target['spec']['topologies'][0]['bindings'][0]["config"]["inCluster"] == "true":
                        cluster_type = "current"
                    else:
                        cluster_type = "other"
                else:
                    cluster_type = "current"

                labels = target['metadata'].get('labels')
                if labels:
                    tags = [{"name": k, "value": v} for k, v in labels.items()]
                else:
                    tags = []
                tag_list = json.dumps(tags)

                compute_device_obj, created = ComputeDevice.objects.update_or_create(
                    name=name,
                    defaults={
                        "iothub": iothub,
                        "iotedge_device": iotedge_device,
                        "architecture": architecture,
                        "acceleration": acceleration,
                        "symphony_id": symphony_id,
                        "solution_id": solution_id,
                        "tag_list": tag_list,
                        "is_k8s": is_k8s,
                        "cluster_type": cluster_type
                    },
                )
                logger.info("ComputeDevice: %s %s.", compute_device_obj,
                            "created" if created else "updated")
        else:
            logger.warning("Not loading symphony targets")

    def get_status(self, name):

        api = self.get_client()

        if api:
            target = api.get_namespaced_custom_object(
                group="fabric.symphony",
                version="v1",
                namespace="default",
                plural="targets",
                name=name
            )
            status = target.get("status", "")
            if status:
                return status['properties']
            else:
                return ""
        else:
            return ""


class SymphonySolutionClient(SymphonyClient):

    def get_config(self):

        name = self.args.get("name", "")
        display_name = self.args.get("display_name", "")
        acceleration = self.args.get("acceleration", "")
        architecture = self.args.get("architecture", "")
        skills = self.args.get("skills", "")
        instance = self.args.get("instance", "")
        iothub = self.args.get("iothub", "")
        iotedge_device = self.args.get("iotedge_device", "")
        module_routes = self.args.get("module_routes", "")

        # workaround for synphony 0.39.7
        is_k8s = self.args.get("is_k8s", False)
        if is_k8s:
            symphony_agent_address = "target-runtime.default.svc.cluster.local"
        else:
            symphony_agent_address = "target-runtime-symphony-agent"

        image_suffix = ""
        create_options = "{\"HostConfig\":{\"LogConfig\":{\"Type\":\"json-file\",\"Config\":{\"max-size\":\"10m\",\"max-file\":\"10\"}}}}"
        if 'igpu' in acceleration.lower():
            image_suffix = 'openvino'
            create_options = "{\"HostConfig\":{\"LogConfig\":{\"Type\":\"json-file\",\"Config\":{\"max-size\":\"10m\",\"max-file\":\"10\"}},\"Binds\":[\"/dev/bus/usb:/dev/bus/usb\"],\"Devices\":[{\"PathOnHost\":\"/dev/dri\",\"PathInContainer\":\"/dev/dri\",\"CgroupPermissions\":\"rwm\"}],\"DeviceCgroupRules\":[\"c 189:* rmw\"]}}"
        elif 'dgpu' in acceleration.lower() or 'jetson' in acceleration.lower():
            image_suffix = 'gpu'
            create_options = "{\"HostConfig\":{\"LogConfig\":{\"Type\":\"json-file\",\"Config\":{\"max-size\":\"10m\",\"max-file\":\"10\"}},\"runtime\":\"nvidia\"}}"
        network_api = self.get_network_client()
        res = network_api.read_namespaced_ingress(name='webmodule', namespace='default')
        webmodule_ip = res.status.load_balancer.ingress[0].ip
        webmodule_url = "http://" + webmodule_ip

        # get storage acount connection string
        storage_resource_group = os.getenv('STORAGE_RESOURCE_GROUP')
        storage_container = os.getenv('STORAGE_CONTAINER')
        storage_account = os.getenv('STORAGE_ACCOUNT')
        res = subprocess.check_output(
            ['az', 'storage', 'account', 'show-connection-string', '--name', storage_account, '--resource-group', storage_resource_group, '-o', 'tsv'])
        storage_conn_str = res.decode('utf8').strip()

        if not is_k8s and iotedge_device and iothub:
            # get iotedge device connection string
            res = subprocess.check_output(['az', 'iot', 'hub', 'device-identity', 'connection-string',
                                           'show', '--device-id', iotedge_device, '--hub-name', iothub, '-o', 'tsv'])
            iotedge_connection_str = res.decode('utf8').strip()
        else:
            iotedge_connection_str = ""

        # routes
        routes = []
        routes.append({
            "route": "InferenceToIoTHub",
            "type": "iothub",
            "properties": {
                "definition": f"FROM /messages/modules/{instance}-streamingmodule/metrics INTO $upstream"
            }

        })
        if module_routes:
            for module_route in module_routes:
                routes.append({
                    "route": f"InferenceTo{module_route['module_name']}",
                    "type": "iothub",
                    "properties": {
                        "definition": f"FROM /messages/modules/{instance}-streamingmodule/localmetrics INTO BrokeredEndpoint(\"/modules/{module_route['module_name']}/inputs/{module_route['module_input']}\")"
                    }

                })

        # container image
        container_version = "0.38.1-dev.1"
        # managermodule_image = f"possprod.azurecr.io/voe/managermodule:{container_version}-amd64"
        # streamingmodule_image = f"possprod.azurecr.io/voe/streamingmodule:{container_version}-amd64"
        # predictmodule_image = f"possprod.azurecr.io/voe/predictmodule:{container_version}-{image_suffix}amd64"
        voeedge_image = f"p4etest.azurecr.io/voe/voeedge:{container_version}-{image_suffix}amd64"

        if 'arm' in architecture.lower():
            voeedge_image = f"p4etest.azurecr.io/voe/voeedge:{container_version}-jetson"
            managermodule_image = f"possprod.azurecr.io/voe/managermodule:{container_version}-jetson"
            streamingmodule_image = f"possprod.azurecr.io/voe/streamingmodule:{container_version}-jetson"
            predictmodule_image = f"possprod.azurecr.io/voe/predictmodule:{container_version}-jetson"

        config_json = {
            "apiVersion": "solution.symphony/v1",
            "kind": "Solution",
            "metadata": {
                "name": name,
            },
            "spec": {
                "components": [
                    # {
                    #     "name": "managermodule",
                    #     "properties": {
                    #         "container.createOptions": "{\"HostConfig\":{\"LogConfig\":{\"Type\":\"json-file\",\"Config\":{\"max-size\":\"10m\",\"max-file\":\"10\"}}}}",
                    #         "container.image": managermodule_image,
                    #         "container.restartPolicy": "always",
                    #         "container.type": "docker",
                    #         "container.version": container_version,
                    #         "env.AISKILLS": skills,
                    #         "env.INSTANCE": "$instance()",
                    #         "env.SYMPHONY_AGENT_ADDRESS": symphony_agent_address
                    #     }
                    # },
                    # {
                    #     "name": "streamingmodule",
                    #     "properties": {
                    #         "container.createOptions": "{\"HostConfig\":{\"LogConfig\":{\"Type\":\"json-file\",\"Config\":{\"max-size\":\"10m\",\"max-file\":\"10\"}}}}",
                    #         "container.image": streamingmodule_image,
                    #         "container.restartPolicy": "always",
                    #         "container.type": "docker",
                    #         "container.version": container_version,
                    #         "env.INSTANCE": "$instance()",
                    #         "env.BLOB_STORAGE_CONNECTION_STRING": storage_conn_str,
                    #         "env.BLOB_STORAGE_CONTAINER": storage_container,
                    #         "env.WEBMODULE_URL": webmodule_url,
                    #         "env.IOTEDGE_CONNECTION_STRING": iotedge_connection_str,
                    #         "env.SYMPHONY_AGENT_ADDRESS": symphony_agent_address
                    #     },
                    #     "routes": routes
                    # },
                    # {
                    #     "name": "predictmodule",
                    #     "properties": {
                    #         "container.createOptions": create_options,
                    #         "container.image": predictmodule_image,
                    #         "container.restartPolicy": "always",
                    #         "container.type": "docker",
                    #         "container.version": container_version,
                    #         "env.INSTANCE": "$instance()"
                    #     }
                    # },
                    {
                        "name": "voeedge",
                        "properties": {
                            "container.createOptions": create_options,
                            "container.image": voeedge_image,
                            "container.restartPolicy": "always",
                            "container.type": "docker",
                            "container.version": container_version,
                            "env.INSTANCE": "$instance()",
                            "env.AISKILLS": skills,
                            "env.BLOB_STORAGE_CONNECTION_STRING": storage_conn_str,
                            "env.BLOB_STORAGE_CONTAINER": storage_container,
                            "env.WEBMODULE_URL": webmodule_url,
                            "env.IOTEDGE_CONNECTION_STRING": iotedge_connection_str,
                            "env.SYMPHONY_AGENT_ADDRESS": symphony_agent_address
                        }
                    }
                ],
                "displayName": display_name
            },
        }
        return config_json

    def touch_config(self, name):

        api = self.get_client()

        if api:
            solution = api.get_namespaced_custom_object(
                group="solution.symphony",
                version="v1",
                namespace="default",
                plural="solutions",
                name=name
            )

            for module in solution['spec']['components']:
                module["properties"]["env.REVISIONS"] = str(
                    int(module["properties"].get("env.REVISIONS", "0")) + 1)

            try:
                api.patch_namespaced_custom_object(
                    group="solution.symphony",
                    version="v1",
                    namespace="default",
                    plural="solutions",
                    name=name,
                    body=solution,
                )
            except Exception as e:
                logger.warning("fail")
                logger.warning(e)
