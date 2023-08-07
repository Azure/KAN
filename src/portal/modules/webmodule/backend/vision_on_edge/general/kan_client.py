# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""Kan utils.
"""

import logging
import json
import os
import requests

from kubernetes import client, config


logger = logging.getLogger(__name__)


class KanClient:
    '''kan sdk operation
    '''

    def __init__(self, **kwargs):
        self.args = {}
        self.group = ""
        self.plural = ""
        self.kan_ip = os.getenv("KAN_IP", "")
        self.kan_url = "http://" + self.kan_ip + ":8080/v1alpha2/agent/references"
        self.kan_auth_url = "http://" + self.kan_ip + ":8080/v1alpha2/users/auth"
        self.kan_api_url = ""
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

    def get_token_from_kan(self):
        '''get bearer token from KAN service
        '''
        auth_headers = {'username': 'admin', 'password':''} 
        res = requests.post(self.kan_auth_url, json=auth_headers)
        data = json.loads(res.content.decode('utf8'))
        if 'accessToken' not in data:
            raise Exception("Cannot get token from KAN.")
        return data['accessToken']


    def load_kan_objects(self):
        raise NotImplementedError

    def process_data(self, obj, multi=False):
        '''transform kan object into key-value json
        '''
        raise NotImplementedError

    def get_config(self):
        raise NotImplementedError

    def get_patch_config(self):
        raise NotImplementedError

    def process_symphony_data(self, obj):
        '''transform object from symphony to previous format
        '''

        obj["metadata"] = {"name": obj.get("id", "")}
        status = obj.get("status", "")
        if status:
            status_ = status.copy()
        else:
            status_ = status
        obj["status"]["properties"] = status_

        return obj

    def get_config_from_kan(self, name):

        if self.plural in ["targets", "solutions", "instances"]:
            # get object from symphony
            try:
                auth_token = self.get_token_from_kan()
                headers = {"Authorization": f"Bearer {auth_token}"}      
                res = requests.get(self.kan_api_url + f'/{name}', headers=headers) 
                kan_object = self.process_symphony_data(json.loads(res.content))

                return kan_object
            except Exception as e:
                logger.warning(e)
                return {}

        else:
            api = self.get_client()
            if api:
                try:
                    kan_object = api.get_namespaced_custom_object(
                        group=self.group,
                        version="v1",
                        namespace="default",
                        plural=self.plural,
                        name=name
                    )
                    return kan_object
                except Exception as e:
                    logger.warning(e)
                    return {}

    def get_configs_from_kan(self):

        if self.plural in ["targets", "solutions", "instances"]:
            # get object from symphony
            try:
                auth_token = self.get_token_from_kan()
                headers = {"Authorization": f"Bearer {auth_token}"}      
                res = requests.get(self.kan_api_url, headers=headers) 
                kan_objects = []
                for kan_object in json.loads(res.content):
                    kan_objects.append(self.process_symphony_data(kan_object))
                return kan_objects
            except Exception as e:
                logger.warning(e)
                return []

        else:
            api = self.get_client()
            if api:
                res = api.list_namespaced_custom_object(
                    group=self.group,
                    version="v1",
                    namespace="default",
                    plural=self.plural
                )
                kan_objects = res['items']

                return kan_objects
            else:
                logger.warning("No kan detected")
                return []      

    def get_object(self, name):

        kan_object = self.get_config_from_kan(name)
        if kan_object:
            return(self.process_data(kan_object, multi=False))
        else:
            return {}

    def get_objects(self):

        kan_objects = self.get_configs_from_kan()
        logger.warning(f"get objects: {kan_objects}")
        res = []
        for kan_object in kan_objects:
            res.append(self.process_data(kan_object, multi=True))

        return res

    def deploy_config(self):
        if self.plural in ["targets", "solutions", "instances"]:
            resource_json = self.get_config()
            # get object from symphony
            try:
                auth_token = self.get_token_from_kan()
                headers = {"Authorization": f"Bearer {auth_token}"}      
                res = requests.post(self.kan_api_url + f'/{resource_json["metadata"]["name"]}', headers=headers, json=resource_json['spec']) 

            except Exception as e:
                logger.warning(e)
        else:
            api = self.get_client()
            if api:
                resource_json = self.get_config()
                logger.warning(resource_json)
                try:
                    api.create_namespaced_custom_object(
                        group=self.group,
                        version="v1",
                        namespace="default",
                        plural=self.plural,
                        body=resource_json,
                    )
                except Exception as e:
                    logger.warning("fail")
                    logger.warning(e)
            else:
                logger.warning("not deployed")

    def update_config(self, name):
        if self.plural in ["targets", "solutions", "instances"]:
            resource_json = self.get_config()
            # get object from symphony
            try:
                auth_token = self.get_token_from_kan()
                headers = {"Authorization": f"Bearer {auth_token}"}      
                res = requests.post(self.kan_api_url + f'/{name}', headers=headers, json=resource_json['spec']) 

            except Exception as e:
                logger.warning(e)
            pass
        else:
            api = self.get_client()
            if api:
                resource_json = self.get_config()
                try:
                    api.patch_namespaced_custom_object(
                        group=self.group,
                        version="v1",
                        namespace="default",
                        plural=self.plural,
                        name=name,
                        body=resource_json,
                    )
                except Exception as e:
                    logger.warning("fail")
                    logger.warning(e)
            else:
                logger.warning("not deployed")

    def patch_config(self, name):
        '''patch k8s object using api_call directly to set the patch strategy 
        '''
        if self.plural in ["targets", "solutions", "instances"]:
            resource_json = self.get_config()
            # get object from symphony
            try:
                auth_token = self.get_token_from_kan()
                headers = {"Authorization": f"Bearer {auth_token}"}      
                res = requests.post(self.kan_api_url + f'/{name}', headers=headers, json=resource_json['spec']) 

            except Exception as e:
                logger.warning(e)
        else:
            api = self.get_client()
            if api:
                try:
                    query_params = []
                    path_params = {
                        "group": self.group,
                        "version": "v1",
                        "namespace": "default",
                        "plural": self.plural,
                        "name": name
                    }
                    header_params = {
                        "Accept": api.api_client.select_header_accept(['application/json']),
                        "Content-Type": api.api_client.select_header_content_type(['application/json-patch+json'])
                    }
                    auth_settings = ['BearerToken']
                    patch_config = self.get_patch_config()
                    logger.warning(patch_config)
                    api.api_client.call_api('/apis/{group}/{version}/namespaces/{namespace}/{plural}/{name}', 'PATCH',
                                            path_params, query_params, header_params, body=patch_config, auth_settings=auth_settings)
                except Exception as e:
                    logger.warning("fail")
                    logger.warning(e)
            else:
                logger.warning("not patched")

    def remove_config(self, name):
        if self.plural in ["targets", "solutions", "instances"]:
            # get object from symphony
            try:
                auth_token = self.get_token_from_kan()
                headers = {"Authorization": f"Bearer {auth_token}"}      
                res = requests.delete(self.kan_api_url + f'/{name}', headers=headers) 

            except Exception as e:
                logger.warning(e)
        else:
            api = self.get_client()
            if api:
                try:
                    api.delete_namespaced_custom_object(
                        group=self.group,
                        version="v1",
                        namespace="default",
                        plural=self.plural,
                        name=name,
                    )
                except Exception as e:
                    logger.warning("fail")
                    logger.warning(e)
            else:
                logger.warning("not removed")
