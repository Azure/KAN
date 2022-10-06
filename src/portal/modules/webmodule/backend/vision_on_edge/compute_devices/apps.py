# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""App.
"""

import sys
import logging
import os
import subprocess

from django.apps import AppConfig

logger = logging.getLogger(__name__)


class ComputeDeviceConfig(AppConfig):
    """App Config."""

    name = "vision_on_edge.compute_devices"

    def ready(self):
        """ready."""

        if "runserver" in sys.argv:
            from .symphony_client import SymphonyTargetClient

            logger.info("App ready ready while running server")
            # az login
            tenant_id = os.getenv('TENANT_ID')
            client_id = os.getenv('CLIENT_ID')
            client_secret = os.getenv('CLIENT_SECRET')

            if tenant_id and client_id and client_secret:
                logger.warning("az login with service principal")
                # already login when webmodule starts
                # res = subprocess.check_output(
                #     ['az', 'login', '--service-principal', '-u', client_id, '-p', client_secret, '--tenant', tenant_id])
            else:
                logger.warning("Cannot login azure, missing service principal")

            # target_client = SymphonyTargetClient()
            # target_client.load_symphony_objects()

            logger.info("App ready end while running server")
