# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""Client Settings

This module finds Custom Vision related configs with following order:
1. System environment variables
2. config.py
"""
import os

from config import (
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


SUBSCRIPTION_ID = os.environ.get("SUBSCRIPTION_ID", SUBSCRIPTION_ID)

# Azure Storage
STORAGE_ACCOUNT = os.environ.get("STORAGE_ACCOUNT", STORAGE_ACCOUNT)
STORAGE_CONTAINER = os.environ.get("STORAGE_CONTAINER", STORAGE_CONTAINER)
STORAGE_RESOURCE_GROUP = os.environ.get(
    "STORAGE_RESOURCE_GROUP", STORAGE_RESOURCE_GROUP)

# AAD
TENANT_ID = os.environ.get("TENANT_ID", TENANT_ID)
CLIENT_ID = os.environ.get("CLIENT_ID", CLIENT_ID)
CLIENT_SECRET = os.environ.get("CLIENT_SECRET", CLIENT_SECRET)
TRAINING_KEY = os.environ.get("TRAINING_KEY", TRAINING_KEY)
ENDPOINT = os.environ.get("ENDPOINT", ENDPOINT)

# Open AI
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", OPENAI_API_KEY)