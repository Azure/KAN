from tkinter import W
from urllib.parse import urlencode

import httpx

from common.symphony_params import crd_params

host = 'localhost'
#host = 'symphony-agent'
port = '8088'


class SymphonyAgentClient:
    def __init__(self, host=host, port=port, scope='default', version='v1', ref='v1alpha2.ReferenceK8sCRD'):
        
        self.url = f'http://{host}:{port}/v1alpha2/agent/references'
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
        r = httpx.get(self.url, params=params)

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

    def export_model(self, name):

        params = self._gen_params('Model')
        params['kind'] = crd_params['Model']['plural']
        params['group'] = crd_params['Model']['group']
        params['id'] = name
        params['lookup'] = 'download'
        params['iteration'] = 'latest'
        params['platform'] = 'ONNX'
        
        r = httpx.get(self.url, params=params)

        return r.json()


if __name__ == '__main__':

   sac = SymphonyAgentClient() 
   print(sac.get_target('sdsdsd'))
