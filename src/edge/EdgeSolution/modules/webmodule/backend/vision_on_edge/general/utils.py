# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""General utils that does not belong to any app
"""
import subprocess
import os

from azure.storage.blob import BlobServiceClient, BlobSasPermissions, generate_blob_sas
from dateutil.relativedelta import relativedelta
from datetime import datetime, timedelta


class AzureBlobClient:

    storage_conn_str = None
    storage_account = os.getenv('STORAGE_ACCOUNT')
    storage_container = os.getenv('STORAGE_CONTAINER')

    def __init__(self):
        self.storage_conn_str = self.get_storage_account_connection_string()

    def get_storage_account_connection_string(self):

        if self.storage_account:
            res = subprocess.check_output(
                ['az', 'storage', 'account', 'show-connection-string', '--name', self.storage_account, '-o', 'tsv'])
            storage_conn_str = res.decode('utf8').strip()
            return storage_conn_str
        else:
            return ""

    def get_container_client(self):
        service_client = BlobServiceClient.from_connection_string(self.storage_conn_str)
        return service_client.get_container_client(self.storage_container)

    def generate_sas_token(self, blob_name):

        storage_info = {}
        for kv in self.storage_conn_str.split(';'):
            key = kv.split('=')[0]
            val = kv[len(key)+1:]
            storage_info[key] = val
        account_key = storage_info.get('AccountKey', "")

        return generate_blob_sas(
            self.storage_account,
            self.storage_container,
            blob_name,
            account_key=account_key,
            permission=BlobSasPermissions(read=True),
            expiry=datetime.utcnow() + timedelta(hours=24),
        )

    def list_video_blobs(self, instance_displayname, skill_displayname, device_displayname):
        container_client = self.get_container_client()
        name_starts_with = f"video-snippet/{instance_displayname}/{skill_displayname}/{device_displayname}/"
        # still need to iterate all to get the last n objects, so list it in the beginning
        # video_list = list(container_client.list_blobs(name_starts_with=name_starts_with))
        video_iter = container_client.list_blobs(name_starts_with=name_starts_with)
        res = []
        video_url_prefix = f"https://{self.storage_account}.blob.core.windows.net/{self.storage_container}/"
        # retrieve latest 20 videos
        video_count = 0
        for video in video_iter:
            video_count += 1
            if video_count >= 20:
                break
            blob_sas = self.generate_sas_token(video.name)
            res.append(
                {
                    "filename": video.name.split(name_starts_with)[1],
                    "url": f"{video_url_prefix}{video.name}?{blob_sas}",
                    "creation_time": video.creation_time.strftime("%Y%m%d%H%M%S")
                }
            )
        return res
