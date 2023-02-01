# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import os

BLOB_STORAGE_CONNECTION_STRING = os.environ.get('BLOB_STORAGE_CONNECTION_STRING', '')
BLOB_STORAGE_CONTAINER = os.environ.get('BLOB_STORAGE_CONTAINER', 'voe')
WEBMODULE_URL = os.environ.get('WEBMODULE_URL', '')
INSTANCE = os.environ.get('INSTANCE', '')
IOTEDGE_CONNECTION_STRING = os.environ.get('IOTEDGE_CONNECTION_STRING', '')
