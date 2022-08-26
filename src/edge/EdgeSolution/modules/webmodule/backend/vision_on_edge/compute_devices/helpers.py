# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import logging

from kubernetes import client, config
from .models import ComputeDevice

logger = logging.getLogger(__name__)


def load_symphony_objects():
    try:
        config.load_incluster_config()
        api = client.CustomObjectsApi()
    except:
        api = None

    if api:
        res = api.list_namespaced_custom_object(
            group="fabric.symphony",
            version="v1",
            namespace="default",
            plural="targets"
        )
        targets = res['items']

        for target in targets:
            name = target['metadata']['name']
            iothub = target['spec']['topologies'][0]['bindings'][0]['config'].get('iotHub', "").split('.')[
                0]
            iotedge_device = target['spec']['topologies'][0]['bindings'][0]['config'].get(
                'deviceName', "")
            architecture = target['spec']['properties'].get('cpu', "")
            acceleration = target['spec']['properties'].get('acceleration', "")

            compute_device_obj, created = ComputeDevice.objects.update_or_create(
                name=name,
                defaults={
                    "iothub": iothub,
                    "iotedge_device": iotedge_device,
                    "architecture": architecture,
                    "acceleration": acceleration,
                },
            )
            logger.info("ComputeDevice: %s %s.", compute_device_obj,
                        "created" if created else "updated")
    else:
        logger.warning("Not creating symphony targets")
