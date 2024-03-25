# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""App.
"""

import logging
import sys

from django.apps import AppConfig

from configs.client_config import (
    SUBSCRIPTION_ID,
    STORAGE_ACCOUNT,
    STORAGE_CONTAINER,
    STORAGE_RESOURCE_GROUP,
    TENANT_ID,
    CLIENT_ID,
    CLIENT_SECRET,
    ENDPOINT,
    TRAINING_KEY,
    OPENAI_API_KEY
)
from configs.iot_config import DEVICE_ID, IOT_HUB_CONNECTION_STRING, MODULE_ID

from .constants import DEFAULT_SETTING_NAME

logger = logging.getLogger(__name__)


class AzureSettingsConfig(AppConfig):
    """App Config"""

    name = "vision_on_edge.azure_settings"

    def ready(self):
        """ready."""

        if "runserver" in sys.argv:
            # pylint: disable=C0415
            from .models import Setting

            logger.info("Azure Settings AppConfig ready while running server")
            logger.info("Setting azure http logging level to WARNING")
            logger.info("Setting django.channels.server logging level to WARNING")
            logging.getLogger("azure.core.pipeline.policies.http_logging_policy").setLevel(
                logging.WARNING)
            logging.getLogger("django.channels.server").setLevel(logging.WARNING)
            logger.info(ENDPOINT)
            logger.info(TRAINING_KEY)
            existing_settings = Setting.objects.filter(
                name=DEFAULT_SETTING_NAME, training_key=TRAINING_KEY, endpoint=ENDPOINT
            )
            if existing_settings.count() == 1:
                logger.info(
                    "Found existing %s. Revalidating in pre_save...",
                    DEFAULT_SETTING_NAME,
                )
                default_setting = existing_settings.get()
                default_setting.save()

            elif Setting.objects.filter(name=DEFAULT_SETTING_NAME).count() > 0:
                logger.info(
                    "Found existing %s with different (Endpoint, key)",
                    DEFAULT_SETTING_NAME,
                )
                logger.info("User may already changed the key ")
                # settings_with_dup_name.delete()
                default_setting = Setting.objects.filter(name=DEFAULT_SETTING_NAME)[0]
                default_setting.save()

            elif (
                Setting.objects.filter(
                    endpoint=ENDPOINT, training_key=TRAINING_KEY
                ).count()
                > 0
            ):
                logger.info("Found existing Endpoint+Key with different name")
                default_setting = Setting.objects.filter(
                    endpoint=ENDPOINT, training_key=TRAINING_KEY
                ).first()
                default_setting.save()
            else:
                logger.info("Creating new %s", DEFAULT_SETTING_NAME)
                default_setting, created = Setting.objects.update_or_create(
                    name=DEFAULT_SETTING_NAME,
                    training_key=TRAINING_KEY,
                    endpoint=ENDPOINT,
                    iot_hub_connection_string=IOT_HUB_CONNECTION_STRING,
                    device_id=DEVICE_ID,
                    module_id=MODULE_ID,
                    subscription_id=SUBSCRIPTION_ID,
                    storage_account=STORAGE_ACCOUNT,
                    storage_container=STORAGE_CONTAINER,
                    storage_resource_group=STORAGE_RESOURCE_GROUP,
                    tenant_id=TENANT_ID,
                    client_id=CLIENT_ID,
                    client_secret=CLIENT_SECRET,
                    openai_api_key=OPENAI_API_KEY
                )
                if not created:
                    logger.error(
                        "%s not created. Something went wrong", DEFAULT_SETTING_NAME
                    )
