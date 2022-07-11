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


class SymphonyAgent:

    Url = 'http://localhost:8088' if is_local() else 'http://target-runtime-symphony-agent:8088'
    Url = 'http://target-runtime-symphony-agent:8088'

class StreamingModule:

    Url = 'http://localhost:5002' if is_local() else 'http://streamingmodule:5002/'

    class Status(BaseModel):
        status: StatusEnum

    class Setting(BaseModel):
        cascade_configs: List[CascadeConfig]



class PredictModule:

    Url = 'http://localhost:5004' if is_local() else 'http://predictmodule:5004/'

    class Status(BaseModel):
        status: StatusEnum

    class Setting(BaseModel):
        model_configs: List[ModelConfig]
