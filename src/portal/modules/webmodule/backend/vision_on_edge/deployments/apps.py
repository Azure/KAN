# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import logging
import sys


from django.apps import AppConfig


logger = logging.getLogger(__name__)


class AzureDeploymentsConfig(AppConfig):
    name = 'vision_on_edge.deployments'

    def ready(self):
        """ready."""

        if "runserver" in sys.argv:

            from .iothub_receive import mqtt_setup
            logger.info("App ready ready while running server")
            logger.warning("Setup MQTT receiver")
            mqtt_setup()

            logger.info("App ready end while running server")
