# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""Symphony utils.
"""

import logging
import json
import os

from kubernetes import client, config


from ..azure_app_insight.utils import get_app_insight_logger

logger = logging.getLogger(__name__)


class SymphonyClient:
    '''symphony sdk operation
    '''

    def __init__(self, **kwargs):
        self.args = {}
        for k, v in kwargs.items():
            self.args[k] = v

    def set_attr(self, attrs: dict):
        for k, v in attrs.items():
            self.args[k] = v

    def get_client(self):
        try:
            config.load_incluster_config()
            api = client.CustomObjectsApi()
        except:
            logger.warning("Cannot load k8s config")
            api = None

        return api

    def get_service_client(self):
        try:
            config.load_incluster_config()
            api = client.CoreV1Api()
        except:
            logger.warning("Cannot load k8s config")
            api = None

        return api

    def get_network_client(self):
        try:
            config.load_incluster_config()
            api = client.NetworkingV1Api()
        except:
            logger.warning("Cannot load k8s config")
            api = None

        return api

    def load_symphony_objects(self):
        raise NotImplementedError

    def get_config(self):
        raise NotImplementedError

    def deploy_config(self, group, plural):
        api_instance = self.get_client()
        if api_instance:
            resource_json = self.get_config()
            logger.warning(resource_json)
            try:
                api_instance.create_namespaced_custom_object(
                    group=group,
                    version="v1",
                    namespace="default",
                    plural=plural,
                    body=resource_json,
                )
            except Exception as e:
                logger.warning("fail")
                logger.warning(e)
        else:
            logger.warning("not deployed")

    def update_config(self, group, plural, name):
        api_instance = self.get_client()
        if api_instance:
            resource_json = self.get_config()
            try:
                api_instance.patch_namespaced_custom_object(
                    group=group,
                    version="v1",
                    namespace="default",
                    plural=plural,
                    name=name,
                    body=resource_json,
                )
            except Exception as e:
                logger.warning("fail")
                logger.warning(e)
        else:
            logger.warning("not deployed")

    def remove_config(self, group, plural, name):
        api_instance = self.get_client()
        if api_instance:
            try:
                api_instance.delete_namespaced_custom_object(
                    group=group,
                    version="v1",
                    namespace="default",
                    plural=plural,
                    name=name,
                )
            except Exception as e:
                logger.warning("fail")
                logger.warning(e)
        else:
            logger.warning("not removed")
