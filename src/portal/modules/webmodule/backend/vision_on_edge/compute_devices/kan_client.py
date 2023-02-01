# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import logging
import os
import json
import subprocess

from ..general.kan_client import KanClient


logger = logging.getLogger(__name__)


class KanTargetClient(KanClient):

    def __init__(self):
        super().__init__()
        self.group = "fabric.kan"
        self.plural = "targets"

    def get_config(self):
        name = self.args.get("name", "")
        iothub = self.args.get("iothub", "")
        iotedge_device = self.args.get("iotedge_device", "")
        architecture = self.args.get("architecture", "")
        acceleration = self.args.get("acceleration", "")
        display_name = self.args.get("display_name", "")
        solution_id = self.args.get("solution_id", "")
        tag_list = self.args.get("tag_list", "[]")
        is_k8s = self.args.get("is_k8s", False)
        cluster_type = self.args.get("cluster_type", "current")
        config_data = self.args.get("config_data", "")
        # connection_str = os.getenv('IOTHUB_CONNECTION_STRING')
        tenant_id = os.getenv('TENANT_ID')
        client_id = os.getenv('CLIENT_ID')
        client_secret = os.getenv('CLIENT_SECRET')
        storage_account = os.getenv('STORAGE_ACCOUNT')
        storage_container = os.getenv('STORAGE_CONTAINER')
        # kan_url = os.getenv('KAN_URL')
        kan_agent_version = os.getenv('KAN_AGENT_VERSION')

        service_api = self.get_service_client()
        res = service_api.read_namespaced_service(
            name='kan-service-ext', namespace='kan-k8s-system')
        kan_ip = res.status.load_balancer.ingress[0].ip
        kan_url = "http://" + kan_ip + ":8080/v1alpha2/agent/references"

        labels = {}
        if tag_list:
            for tag in json.loads(tag_list):
                labels[tag["name"]] = tag["value"]

        if is_k8s:
            provider = "providers.target.k8s"
            if cluster_type == "current":
                config = {
                    "inCluster": "true",
                    "deploymentStrategy": "services"
                }
            else:
                # TODO to be modified to provided config
                config = {
                    "inCluster": "false",
                    "deploymentStrategy": "services",
                    "configType": "bytes",
                    "configData": config_data
                }
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
            "apiVersion": "fabric.kan/v1",
            "kind": "Target",
            "metadata": {
                "name": name,
                "labels": labels
            },
            "spec": {
                "name": name,
                "displayName": display_name,
                "forceRedeploy": True,
                "components": [
                    {
                        "name": "kan-agent",
                        "metadata": {
                            "deployment.replicas": "#1",
                            "service.ports": "[{\"name\":\"port8088\",\"port\": 8088}]",
                            "service.type": "ClusterIP",
                            "service.name": "kan-agent"
                        },
                        "properties": {
                            "container.version": "1.0",
                            "container.type": "docker",
                            "container.image": "possprod.azurecr.io/kan-agent:"+kan_agent_version,
                            "container.createOptions": "{\"HostConfig\":{\"Binds\":[\"/etc/iotedge/storage:/snapshots\"],\"LogConfig\":{\"Type\":\"json-file\",\"Config\":{\"max-size\":\"10m\",\"max-file\":\"10\"}}}}",
                            "container.restartPolicy": "always",
                            "env.AZURE_CLIENT_ID": client_id,
                            "env.AZURE_TENANT_ID": tenant_id,
                            "env.AZURE_CLIENT_SECRET": client_secret,
                            "env.STORAGE_ACCOUNT": storage_account,
                            "env.STORAGE_CONTAINER": storage_container,
                            "env.KAN_URL": kan_url,
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

        tag_list = self.args.get("tag_list", "[]")

        labels = {}
        if tag_list:
            for tag in json.loads(tag_list):
                labels[tag["name"]] = tag["value"]

        # can only patch labels on portal for now
        patch_config = [
            {'op': 'replace', 'path': '/metadata/labels', 'value': labels},
        ]
        return patch_config

    def load_kan_objects(self):
        from .models import ComputeDevice

        api = self.get_client()
        if api:
            res = api.list_namespaced_custom_object(
                group="fabric.kan",
                version="v1",
                namespace="default",
                plural="targets"
            )
            targets = res['items']

            for target in targets:
                name = target['spec']['displayName']
                kan_id = target['metadata']['name']
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
                        "kan_id": kan_id,
                        "solution_id": solution_id,
                        "tag_list": tag_list,
                        "is_k8s": is_k8s,
                        "cluster_type": cluster_type
                    },
                )
                logger.info("ComputeDevice: %s %s.", compute_device_obj,
                            "created" if created else "updated")
        else:
            logger.warning("Not loading kan targets")

    def process_data(self, target, multi):

        name = target['spec']['displayName']
        kan_id = target['metadata']['name']
        iothub = target['spec']['topologies'][0]['bindings'][0]['config'].get(
            'iotHub', "").split('.')[0]
        iotedge_device = target['spec']['topologies'][0]['bindings'][0]['config'].get(
            'deviceName', "")
        architecture = target['spec'].get("properties", {}).get('cpu', "")
        acceleration = target['spec'].get("properties", {}).get('acceleration', "")
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

        res = {
            "name": name,
            "iothub": iothub,
            "iotedge_device": iotedge_device,
            "architecture": architecture,
            "acceleration": acceleration,
            "kan_id": kan_id,
            "solution_id": solution_id,
            "tag_list": tag_list,
            "is_k8s": is_k8s,
            "cluster_type": cluster_type,
        }

        # status
        if not multi:
            status = target.get("status", "")
            if status:
                processed_status = self.process_status(status['properties'])
            else:
                processed_status = ""
            res["status"] = processed_status

        return res

    def process_status(self, status):
        from ..cameras.kan_client import KanDeviceClient
        device_client = KanDeviceClient()

        camera_table = {i["kan_id"]: i["name"]
                        for i in device_client.get_objects()}

        status_table = {}

        for key in status.keys():
            cam = key.split('.')[0]
            if cam and cam in camera_table.keys():
                if status[key] == "connected":
                    status_table[camera_table[cam]] = "connected"
                else:
                    if cam not in status_table.keys():
                        status_table[camera_table[cam]] = "disconnected"

        return json.dumps(status_table)

    def get_status(self, name):

        api = self.get_client()

        if api:
            target = api.get_namespaced_custom_object(
                group="fabric.kan",
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

    def get_solution_id(self, name):
        api = self.get_client()

        if api:
            target = api.get_namespaced_custom_object(
                group="fabric.kan",
                version="v1",
                namespace="default",
                plural="targets",
                name=name
            )
            return target['spec'].get("properties", {}).get('solutionId', "")
        else:
            return ""


class KanSolutionClient(KanClient):

    def __init__(self):
        super().__init__()
        self.group = "solution.kan"
        self.plural = "solutions"

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
        is_grpc = self.args.get("is_grpc", False)
        grpc_components = self.args.get("grpc_components", [])
        # workaround for kan 0.39.7
        is_k8s = self.args.get("is_k8s", False)
        if is_k8s:
            kan_agent_address = "target-runtime.default.svc.cluster.local"
        else:
            kan_agent_address = "target-runtime-kan-agent"

        image_suffix = ""
        container_resources = ""
        create_options = "{\"HostConfig\":{\"LogConfig\":{\"Type\":\"json-file\",\"Config\":{\"max-size\":\"10m\",\"max-file\":\"10\"}}}}"
        if 'igpu' in acceleration.lower():
            image_suffix = 'openvino'
            create_options = "{\"HostConfig\":{\"LogConfig\":{\"Type\":\"json-file\",\"Config\":{\"max-size\":\"10m\",\"max-file\":\"10\"}},\"Binds\":[\"/dev/bus/usb:/dev/bus/usb\"],\"Devices\":[{\"PathOnHost\":\"/dev/dxg\",\"PathInContainer\":\"/dev/dxg\",\"CgroupPermissions\":\"rwm\"}]}}"
        elif 'dgpu' in acceleration.lower() or 'jetson' in acceleration.lower():
            image_suffix = 'gpu'
            container_resources = "{\"limits\":{\"nvidia.com/gpu\":\"1\"}}"
            create_options = "{\"HostConfig\":{\"LogConfig\":{\"Type\":\"json-file\",\"Config\":{\"max-size\":\"10m\",\"max-file\":\"10\"}},\"runtime\":\"nvidia\"}}"
        network_api = self.get_network_client()
        res = network_api.read_namespaced_ingress(
            name='kanportal', namespace='default')
        webmodule_ip = res.status.load_balancer.ingress[0].ip
        webmodule_url = "http://" + webmodule_ip

        # get storage acount connection string
        storage_resource_group = os.getenv('STORAGE_RESOURCE_GROUP')
        storage_container = os.getenv('STORAGE_CONTAINER')
        storage_account = os.getenv('STORAGE_ACCOUNT')
        if storage_resource_group and storage_account:
            try:
                res = subprocess.check_output(
                    ['az', 'storage', 'account', 'show-connection-string', '--name', storage_account, '--resource-group', storage_resource_group, '-o', 'tsv'])
                storage_conn_str = res.decode('utf8').strip()
            except Exception as e:
                logger.warning(e)
                storage_conn_str = ""
        else:
            storage_conn_str = ""

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
                "definition": f"FROM /messages/modules/{instance}-kanai/metrics INTO $upstream"
            }

        })
        if module_routes:
            for module_route in module_routes:
                routes.append({
                    "route": f"InferenceTo{module_route['module_name']}",
                    "type": "iothub",
                    "properties": {
                        "definition": f"FROM /messages/modules/{instance}-kanai/localmetrics INTO BrokeredEndpoint(\"/modules/{module_route['module_name']}/inputs/{module_route['module_input']}\")"
                    }

                })

        # container image
        container_version = "0.41.40"
        # managermodule_image = f"possprod.azurecr.io/voe/managermodule:{container_version}-amd64"
        # streamingmodule_image = f"possprod.azurecr.io/voe/streamingmodule:{container_version}-amd64"
        # predictmodule_image = f"possprod.azurecr.io/voe/predictmodule:{container_version}-{image_suffix}amd64"
        voeedge_image = f"kanprod.azurecr.io/kanai:{container_version}-{image_suffix}amd64"

        if 'arm' in architecture.lower():
            voeedge_image = f"kanprod.azurecr.io/kanai:{container_version}-jetson"
            managermodule_image = f"possprod.azurecr.io/voe/managermodule:{container_version}-jetson"
            streamingmodule_image = f"possprod.azurecr.io/voe/streamingmodule:{container_version}-jetson"
            predictmodule_image = f"possprod.azurecr.io/voe/predictmodule:{container_version}-jetson"

        config_json = {
            "apiVersion": "solution.kan/v1",
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
                    #         "env.KAN_AGENT_ADDRESS": kan_agent_address
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
                    #         "env.KAN_AGENT_ADDRESS": kan_agent_address
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
                        "name": "kanai",
                        "type": "container",
                        "properties": {
                            "container.createOptions": create_options,
                            "container.image": voeedge_image,
                            "container.resources": container_resources,
                            "container.restartPolicy": "always",
                            "container.type": "docker",
                            "container.version": container_version,
                            "env.INSTANCE": "$instance()",
                            # "env.AISKILLS": skills,
                            "env.BLOB_STORAGE_CONNECTION_STRING": storage_conn_str,
                            "env.BLOB_STORAGE_CONTAINER": storage_container,
                            "env.WEBMODULE_URL": webmodule_url,
                            "env.IOTEDGE_CONNECTION_STRING": iotedge_connection_str,
                            # "env.KAN_AGENT_ADDRESS": kan_agent_address
                        },
                        "routes": routes
                    }
                ],
                "displayName": display_name
            },
        }
        # add grpc container(s) if specified
        if is_grpc and grpc_components:
            config_json["spec"]["components"] += grpc_components
        # add container.resources to request gpu
        if container_resources:
            config_json["spec"]["components"][0]["properties"]["container.resources"] = container_resources
        return config_json

    def touch_config(self, name):

        is_grpc = self.args.get("is_grpc", False)
        grpc_components = self.args.get("grpc_components", [])

        api = self.get_client()

        if api:
            solution = api.get_namespaced_custom_object(
                group="solution.kan",
                version="v1",
                namespace="default",
                plural="solutions",
                name=name
            )

            if is_grpc and grpc_components:
                solution["spec"]["components"] += grpc_components

            for module in solution['spec']['components']:
                module["properties"]["env.REVISIONS"] = str(
                    int(module["properties"].get("env.REVISIONS", "0")) + 1)

            try:
                api.patch_namespaced_custom_object(
                    group="solution.kan",
                    version="v1",
                    namespace="default",
                    plural="solutions",
                    name=name,
                    body=solution,
                )
            except Exception as e:
                logger.warning("fail")
                logger.warning(e)

    def get_patch_config(self):

        tag_list = self.args.get("tag_list", "[]")

        labels = {}
        if tag_list:
            for tag in json.loads(tag_list):
                labels[tag["name"]] = tag["value"]

        patch_config = [
            {'op': 'replace', 'path': '/metadata/labels', 'value': labels},
        ]
        return patch_config
