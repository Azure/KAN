# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""App utilities.
"""

import logging
from azure.identity import ClientSecretCredential
from opencensus.ext.azure.log_exporter import AzureLogHandler

from configs.app_insight import (
    APP_INSIGHT_CONN_STR,
    APPLICATIONINSIGHTS_TENANT_ID,
    APPLICATIONINSIGHTS_CLIENT_ID,
    APPLICATIONINSIGHTS_CLIENT_SECRET
)


def get_app_insight_logger() -> logging.Logger:
    """get_app_insight_logger.

    Return a logger with AzureLogHandler added.

    Returns:
        logging.Logger:
    """
    app_insight_logger = logging.getLogger("Backend-Training-App-Insight")
    app_insight_logger.handlers = []
    try:
        cred = ClientSecretCredential(
            tenant_id=APPLICATIONINSIGHTS_TENANT_ID,
            client_id=APPLICATIONINSIGHTS_CLIENT_ID,
            client_secret=APPLICATIONINSIGHTS_CLIENT_SECRET
        )
        app_insight_logger.addHandler(
            AzureLogHandler(credential=cred, connection_string=APP_INSIGHT_CONN_STR)
        )
    except:
        pass

    return app_insight_logger
