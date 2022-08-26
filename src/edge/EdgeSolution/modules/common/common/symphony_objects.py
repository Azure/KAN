# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

from platform import node
from pydantic import BaseModel, Field, Extra
from typing import List
try:
    from typing import Literal
except:
    from typing_extensions import Literal

from common.symphony_params import crd_params

from common.symphony_skill import Node, Edge

############
# Skilli   #
############

class SkillSpec(BaseModel):
    #models: List['SkillModel']
    displayName: str
    nodes: list[Node]
    edges: list[Edge]

#class SkillModel(BaseModel):
#    properties: 'SkillModelProperties'

#class SkillModelProperties(BaseModel):
#    cascade: str #FIXME should be CascadeConfig, need symphony change crd def

#SkillModel.update_forward_refs()
#SkillSpec.update_forward_refs()




############
# Solution #
############

    
class SolutionSpec(BaseModel):
    components: List['SolutionComponents']

class SolutionComponents(BaseModel):
    name: str
    properties: 'SolutionComponentProperties'

class SolutionComponentProperties(BaseModel):
    container_version       : str = Field('1.0', alias='container.version')
    container_type          : str = Field('docker', alias='container.type')
    container_image         : str = Field(..., alias='container.image')
    container_create_options: str = Field('',      alias='container.createOptions')
    container_restart_policy: str = Field('always', alias='container.restartPolicy')
    env_ai_skills           : str = Field(...,  alias='env.AISKILLS')
    env_instance            : str = Field('$instance()', alias='env.INSTANCE')



SolutionComponents.update_forward_refs()
SolutionSpec.update_forward_refs()

# usage
#s = SolutionComponentProperties(**{'env.AISKILLS':'a', 'container.image':'b'})



############
# Instance #
############


class InstanceSpec(BaseModel):
    parameters: dict
    solution: str
    target: 'InstanceTarget'

class InstanceTarget(BaseModel):
    name: str


InstanceSpec.update_forward_refs()


#########
# Model #
#########


class ModelSpec(BaseModel):
    properties: 'ModelProperties'

class ModelProperties(BaseModel):

    model_type: Literal['customvision', 'modelzoo'] = Field(..., alias='model.type')
    model_subtype: str = Field(..., alias='model.subtype')
    model_project: str = Field(..., alias='model.project')
    # extra: model.version.1
    # extra: model.version.2
    # ...
    # extra: model.version.n
    tags: str
    state: str #FIXME trained?

class CustomVisionModelPropeties(ModelProperties):
    model_type    : Literal['customvision'] = Field('customvision', alias='model.type')
    model_subtype : Literal['customvision.ObjectDetection', 'customvision.ObjectDetection']
    model_endpoint: str = Field(..., alias='model.endpoint')
    class Config:
        extra = Extra.allow

class ModelZooModelProperties(ModelProperties):
    model_type : str = Field('modelzoo', alias='model.type')
    model_subtype : Literal['intel.ObjectDetection', 'intel.Classification']



ModelSpec.update_forward_refs()

class ModelExport(BaseModel):
    downloadUri: str
    flavor: str
    newerVersionAvailable: bool
    platform: str
    status: str


class ModelExports(BaseModel):
    __root__: List[ModelExport]

