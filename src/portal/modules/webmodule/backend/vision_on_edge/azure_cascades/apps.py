# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import logging
import sys

from django.apps import AppConfig


logger = logging.getLogger(__name__)


class AzureCascadesConfig(AppConfig):
    name = 'vision_on_edge.azure_cascades'

    def ready(self):
        """ready."""

        if "runserver" in sys.argv:

            logger.info("App ready ready while running server")
            logger.info("App ready end while running server")
