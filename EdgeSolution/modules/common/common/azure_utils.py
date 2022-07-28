from azure.storage.blob import BlobServiceClient

from common.env import BLOB_STORAGE_CONNECTION_STRING, BLOB_STORAGE_CONTAINER

blob_storage_client = BlobServiceClient.from_connection_string(BLOB_STORAGE_CONNECTION_STRING)

def get_blob_client(filename):
    return blob_storage_client.get_blob_client(BLOB_STORAGE_CONTAINER, filename)