from typing import Literal, Optional

from pydantic import BaseModel

class ModelConfig(BaseModel):
    name: str 
    provider: Literal['customvision', 'modelzoo']
    executor: Literal['customvision', 'openvino', 'onnxruntime']
    type: Literal['ObjectDetection', 'Classificication']
    download_uri: Optional[str]

    
