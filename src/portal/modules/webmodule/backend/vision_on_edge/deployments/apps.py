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
            from .symphony_client import SymphonyInstanceClient

            logger.info("App ready ready while running server")

            # instance_client = SymphonyInstanceClient()
            # instance_client.load_symphony_objects()

            logger.info("App ready end while running server")
