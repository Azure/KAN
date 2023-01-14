# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

from azure.storage.blob import BlobServiceClient

from common.env import BLOB_STORAGE_CONNECTION_STRING, BLOB_STORAGE_CONTAINER

try:
    blob_storage_client = BlobServiceClient.from_connection_string(BLOB_STORAGE_CONNECTION_STRING)
except:
    blob_storage_client = None

def get_blob_client(filename):

    if blob_storage_client is None: return None

    return blob_storage_client.get_blob_client(BLOB_STORAGE_CONTAINER, filename)
