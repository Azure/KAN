# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

from enum import Enum

from typing import List
from pydantic import BaseModel, Field
import numpy as np
from common.env import INSTANCE

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


class Attribute(BaseModel):
    #timestamp: float
    name: str
    label: str
    confidence: float
    #inference_id: str


class ObjectMeta(BaseModel):
    #timestamp: float
    label: str
    confidence: float
    #inference_id: str
    attributes: List[Attribute] #FIXME
    bbox: Bbox


class InsightsMeta(BaseModel):
    objects_meta: List[ObjectMeta] = []


class Frame(BaseModel):
    image: Image
    insights_meta: InsightsMeta = InsightsMeta()
    timestamp: float
    frame_id: str
    instance_id: str = INSTANCE
    skill_id: str
    device_id: str
    datetime: str
