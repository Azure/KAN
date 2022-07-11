from enum import Enum

from pydantic import BaseModel, Field
import numpy as np

class ColorFormat(Enum):
    RGB = 'RGB'
    BGR = 'BGR'


class ImageProperties(BaseModel):
    height: int
    width: int
    color_format: ColorFormat


class Image(BaseModel):
    image_pointer: np.ndarray = Field(..., exclude=True)
    properties: ImageProperties
    class Config:
        arbitrary_types_allowed = True


class Bbox(BaseModel):
    l: float
    t: float
    w: float
    h: float


class ObjectMeta(BaseModel):
    #timestamp: float
    label: str
    confidence: float
    #inference_id: str
    #attributes: list[str] #FIXME
    bbox: Bbox


class InsightsMeta(BaseModel):
    objects_meta: list[ObjectMeta] = []


class Frame(BaseModel):
    image: Image
    insights_meta: InsightsMeta = InsightsMeta()

