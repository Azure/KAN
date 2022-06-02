from enum import Enum

from attrs import define, field
import numpy as np

class ColorFormat(Enum):
    RGB = 'RGB'
    BGR = 'BGR'


@define
class ImageProperties:
    height: int
    width: int
    color_format: ColorFormat


@define
class Image:
    image_pointer: np.ndarray
    properties: ImageProperties


@define
class Bbox:
    l: float
    t: float
    w: float
    h: float

@define
class ObjectMeta:
    #timestamp: float
    label: str
    #confidence: float
    #inference_id: str
    #attributes: list[str] #FIXME
    bbox: Bbox

@define
class InsightsMeta:
    objects_meta: list[ObjectMeta] = field(default=[])

@define
class Frame:
    image: Image
    insights_meta: InsightsMeta = field(default=InsightsMeta())

