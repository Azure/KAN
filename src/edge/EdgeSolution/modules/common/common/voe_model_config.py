# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

from typing import Optional
try:
    from typing import Literal
except:
    from typing_extensions import Literal

from pydantic import BaseModel

class ModelConfig(BaseModel):
    #symphony_name: str
    name: str 
    provider: Literal['customvision', 'modelzoo']
    executor: Literal['customvision', 'openvino', 'onnxruntime', 'openai']
    type: Literal['ObjectDetection', 'Classification', 'GPT4']
    download_uri: Optional[str] = None

    
