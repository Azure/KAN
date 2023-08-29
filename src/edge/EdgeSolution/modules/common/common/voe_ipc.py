# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

#
# Some Inter-Container Communication Schema
#

import os
from enum import Enum
from typing import Optional, Dict, List
from pydantic import BaseModel

from common.voe_cascade_config import CascadeConfig
from common.voe_model_config import ModelConfig
from common.voe_status import ModuleStatus, StatusEnum


def is_local():
    if 'IOTEDGE_MODULEID' in os.environ:
        return False
    
    return True

def is_iotedge():
    if 'IOTEDGE_MODULEID' in os.environ:
        return True
    return False


def is_symphony():
    if 'INSTANCE' in os.environ:
        return True
    return False

def get_instance_name():
    return os.environ['INSTANCE']

def get_symphony_agent_host():
    return os.environ['SYMPHONY_AGENT_ADDRESS']

class SymphonyAgent:

    Url = 'http://localhost:8088' if is_local() else 'http://target-runtime-symphony-agent:8088'
    Url = f'http://{get_symphony_agent_host()}:8088'

#class SymphonyAgent:
#
#    Url = 'http://localhost:8088' if is_local() else 'http://target-runtime-symphony-agent:8088'
#    Url = 'http://target-runtime-symphony-agent:8088'

    
class StreamingModule:

    Url = 'http://streamingmodule:5002'
    if is_local(): 
        Url = 'http://localhost:5002' 
    elif is_symphony():
        Url = f'http://{get_instance_name()}-streamingmodule:5002'

    class Status(BaseModel):
        status: StatusEnum

    class Setting(BaseModel):
        cascade_configs: List[CascadeConfig]

class StreamingModuleSetting(BaseModel):
    cascade_configs: List[CascadeConfig]


class PredictModule:

    Url = 'http://predictmodule:5004'
    if is_local(): 
        Url = 'http://localhost:5004' 
    elif is_symphony():
        Url = f'http://{get_instance_name()}-predictmodule:5004'

    class Status(BaseModel):
        status: StatusEnum

    class Setting(BaseModel):
        model_configs: List[ModelConfig]

class PredictModuleSetting(BaseModel):
    model_configs: List[ModelConfig]
