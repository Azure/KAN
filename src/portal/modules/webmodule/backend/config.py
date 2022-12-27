# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""
Settings

Do not import this file in code. Instead, import configs.xxx, which read
environment variables as well.

Related fields will be overwritten by environment variables (if set).
"""
SUBSCRIPTION_ID = ""

# Azure Custom Vision
TRAINING_KEY = ""
ENDPOINT = ""

# Azure IOT
IOT_HUB_CONNECTION_STRING = ""
DEVICE_ID = ""
MODULE_ID = ""

# DEFAULT_INFERENCE_MODULE
DF_PD_VIDEO_SOURCE = False

# Azure Storage
STORAGE_ACCOUNT = ""
STORAGE_CONTAINER = ""
STORAGE_RESOURCE_GROUP = ""

# AAD
TENANT_ID = ""
CLIENT_ID = ""
CLIENT_SECRET = ""
