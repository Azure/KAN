# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

from kubernetes import client, config, watch
from pydantic import BaseModel

from common.kan_params import crd_params

# FIXME
config.load_kube_config()

#class Skill(BaseModel):
#    spec     



class KanClient:
    def __init__(self,namespace='default', version='v1'):
        self.version = version
        self.namespace = namespace
        self.crd_api = client.CustomObjectsApi()

    def _gen_base_params(self, crd_name):
        return {
            'version': self.version,
            'namespace': self.namespace,
            'plural': crd_params[crd_name]['plural'],
            'group': crd_params[crd_name]['group'],
        }

    def _get_api_version(self, crd_name):
        return f"{crd_params[crd_name]['group']}/{self.version}"


    def _get(self, crd_name, object_name):

        params = self._gen_base_params(crd_name)
        params['name'] = object_name

        #FIXME error handling
        r = self.crd_api.get_namespaced_custom_object(**params)

        return r

    def _create(self, crd_name, object_name, spec):

        params = self._gen_base_params(crd_name)
        params['body'] = {
            'apiVersion': self._get_api_version(crd_name),
            'kind': crd_name,
            'metadata': {
                'name': object_name,
            },
            'spec': spec
        }

        r = self.crd_api.create_namespaced_custom_object(**params)

        return r

    def _patch(self, crd_name, object_name, spec):

        params = self._gen_base_params(crd_name)
        params['name'] = object_name
        params['body'] = {
            'apiVersion': self._get_api_version(crd_name),
            'kind': crd_name,
            'metadata': {
                'name': object_name,
            },
            'spec': spec
        }

        r = self.crd_api.patch_namespaced_custom_object(**params)

        return r

       
    def _delete(self, crd_name, object_name):

        params = self._gen_base_params(crd_name)
        params['name'] = object_name

        r = self.crd_api.delete_namespaced_custom_object(**params)

        return r

    ### Target


    ### Device

    ### Solution

    def get_solution(self, name):

        #FIXME deal with notfound error

        return self._get(crd_name='Solution', object_name=name)


    def create_solution(self, name, spec):

        #FIXME deal with conflict error

        return self._create(crd_name='Solution', object_name=name, spec=spec.dict(by_alias=True))


    def patch_solution(self, name, spec):

        #FIXME deal with notfound error

        return self._patch(crd_name='Solution', object_name=name, spec=spec.dict(by_alias=True))


    def delete_solution(self, name):

        #FIXME deal with notfound error

        return self._delete(crd_name='Solution', object_name=name)


    ### Instance

    def get_instance(self, name):

        #FIXME deal with notfound error

        return self._get(crd_name='Instance', object_name=name)


    def create_instance(self, name, spec):

        #FIXME deal with conflict error

        return self._create(crd_name='Instance', object_name=name, spec=spec.dict(by_alias=True))


    def patch_instance(self, name, spec):

        #FIXME deal with notfound error

        return self._patch(crd_name='Instance', object_name=name, spec=spec.dict(by_alias=True))


    def delete_instance(self, name):

        #FIXME deal with notfound error

        return self._delete(crd_name='Instance', object_name=name)

    ### Model

    ### Skill

    def get_skill(self, name):

        #FIXME deal with notfound error

        return self._get(crd_name='Skill', object_name=name)


    def create_skill(self, name, spec):

        #FIXME deal with conflict error

        return self._create(crd_name='Skill', object_name=name, spec=spec.dict())


    def patch_skill(self, name, spec):

        #FIXME deal with notfound error

        return self._patch(crd_name='Skill', object_name=name, spec=spec.dict())


    def delete_skill(self, name):

        #FIXME deal with notfound error

        return self._delete(crd_name='Skill', object_name=name)


if __name__ == '__main__':

    sc = KanClient()
    from common.kan_objects import SkillSpec, ModelSpec, SolutionSpec, InstanceSpec


    solution_spec = SolutionSpec(components=[
        {
            'name': 'managermodule',
            'properties': {
                #"container.image": "mcr.microsoft.com/azureiotedge-simulated-temperature-sensor:1.0",
                'container.image': 'testvoe.azurecr.io/voe/managermodule:0.36.4-dev.1-amd64',
                "env.AISKILLS": "['willy-skill']"
            }

        }
    ])

    sc.patch_solution('willy-solution', solution_spec)
    #sc.patch_solution('willy-solution', solution_spec)


    instance_spec = InstanceSpec(
            parameters={},
            solution='willy-solution',
            target={'name': 'target-cam5'}
    )
    #sc.create_instance('willy-instance', instance_spec)

    #exit()

    import json
    j = json.load(open('sample.json'))
    skill_spec = SkillSpec(models=[
        {
            'properties': {
                'cascade': json.dumps(j)
            }
        }
    ])

    #sc.create_skill('willy-skill', skill_spec)




    
