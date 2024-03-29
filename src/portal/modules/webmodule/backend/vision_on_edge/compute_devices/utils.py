# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import json
import os
import subprocess

from azure.identity import ClientSecretCredential
from azure.iot.hub import IoTHubRegistryManager
from azure.mgmt.resource import ResourceManagementClient


def get_credential():
    tenant_id = os.getenv('TENANT_ID')
    client_id = os.getenv('CLIENT_ID')
    client_secret = os.getenv('CLIENT_SECRET')
    if tenant_id and client_id and client_secret:
        return ClientSecretCredential(
            tenant_id=tenant_id,
            client_id=client_id,
            client_secret=client_secret
        )
    else:
        return ""


def list_iothub():
    credential = get_credential()
    if not credential:
        return []

    subscription_id = os.getenv('SUBSCRIPTION_ID')
    resource_client = ResourceManagementClient(credential, subscription_id)
    rs = resource_client.resources.list()
    iothub_list = []
    for r in rs:
        if r.type == "Microsoft.Devices/IotHubs":
            iothub_list.append(r.name)

    return iothub_list


def list_devices(iothub_name):
    credential = get_credential()
    if not credential:
        return []
    # iothub_url = f"{iothub_name}.azure-devices.net"
    # iot = IoTHubRegistryManager.from_token_credential(
    #     url=iothub_url, token_credential=credential)
    # device_list = [i.device_id for i in iot.get_devices()]

    device_list = []
    command = f"az iot hub device-identity list --hub-name {iothub_name} -o json"
    for device in json.loads(subprocess.check_output(command.split(), encoding='UTF-8')):
        if device['capabilities']['iotEdge']:
            device_list.append(device['deviceId'])

    return device_list
