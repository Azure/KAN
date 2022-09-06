# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

from urllib.parse import urlencode

import httpx

from common.symphony_params import crd_params
from common.voe_ipc import SymphonyAgent

#host = 'localhost'
#host = 'symphony-agent'
#port = '8088'


class SymphonyAgentClient:
    #def __init__(self, host=host, port=port, scope='default', version='v1', ref='v1alpha2.ReferenceK8sCRD'):
    def __init__(self, scope='default', version='v1', ref='v1alpha2.ReferenceK8sCRD'):   
        #self.url = f'http://{host}:{port}/v1alpha2/agent/references'
        
        self.url = f'{SymphonyAgent.Url}/v1alpha2/agent/references'

        self.scope = scope
        self.version = version
        self.ref = ref

    def _gen_params(self, crd_name):

        return {
            'scope': self.scope,
            'version': self.version,
            'ref': self.ref
        }

    def _get(self, crd_name, object_name):

        params = self._gen_params(crd_name)
        params['kind'] = crd_params[crd_name]['plural']
        params['group'] = crd_params[crd_name]['group']
        params['id'] = object_name


        #FIXME error handling
        #print(params)
        try:
            r = httpx.get(self.url, params=params)
        except:
            raise Exception('Cannot access Symphony Agent')

        return r.json()


    def get_target(self, name):
        return self._get('Target', name)

    def get_device(self, name):
        return self._get('Device', name)

    def get_solution(self, name):
        return self._get('Solution', name)

    def get_instance(self, name):
        return self._get('Instance', name)

    def get_skill(self, name):
        return self._get('Skill', name)

    def get_model(self, name):
        return self._get('Model', name)

    def get_skill_with_instance_name_and_alias(self, name, instance_name, alias):

        params = self._gen_params('Skill')
        params['kind'] = crd_params['Skill']['plural']
        params['group'] = crd_params['Skill']['group']
        params['id'] = name
        
        params['instance'] = instance_name
        params['alias'] = alias

        try:
            r = httpx.get(self.url, params=params)
        except:
            raise Exception('Cannot access Symphony Agent')

        return r.json()

    def export_model(self, name):

        params = self._gen_params('Model')
        params['kind'] = crd_params['Model']['plural']
        params['group'] = crd_params['Model']['group']
        params['id'] = name

        params['lookup'] = 'download'
        params['iteration'] = 'latest'
        params['platform'] = 'ONNX'
        
        try:
            r = httpx.get(self.url, params=params)
        except:
            raise Exception('Cannot access Symphony Agent')

        return r.json()

    def _post(self, crd_name, object_name, data):

        params = self._gen_params(crd_name)
        params['kind'] = crd_params[crd_name]['plural']
        params['group'] = crd_params[crd_name]['group']
        params['id'] = object_name


        
        try:
            r = httpx.post(self.url, params=params, json=data)
        except:
            raise Exception('Cannot access Symphony Agent')
        
    def post_instance_status(self, name, status_code, status_description):
        self._post('Instance', name, data={"status_code": status_code, "status_description": status_description})

    def post_instance_fps(self, name, skill_name, fps):
        self._post('Instance', name, data={f'fps_{skill_name}': str(fps)})

if __name__ == '__main__':

   sac = SymphonyAgentClient() 
   print(sac.get_target('sdsdsd'))
