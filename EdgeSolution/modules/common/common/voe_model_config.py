from typing import Literal, Optional

from pydantic import BaseModel

class ModelConfig(BaseModel):
    #symphony_name: str
    name: str 
    provider: Literal['customvision', 'modelzoo']
    executor: Literal['customvision', 'openvino', 'onnxruntime']
    type: Literal['ObjectDetection', 'Classification']
    download_uri: Optional[str]

    
