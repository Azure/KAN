from typing import List

import requests
from pydantic import BaseModel

from core import Model
from frame import Frame, Bbox, ObjectMeta, Attribute
from common.voe_ipc import PredictModule

class FakeModel(Model):
    def process(self, frame):

        fake_bbox1 = Bbox(l=0.1, t=0.1, w=0.1, h=0.1)
        object_meta1 = ObjectMeta(label='person', bbox=fake_bbox1, confidence=0.5)

        fake_bbox2 = Bbox(l=0.4, t=0.4, w=0.1, h=0.1)
        object_meta2 = ObjectMeta(label='cat', bbox=fake_bbox2, confidence=0.9)

        frame.insights_meta.objects_meta.append(object_meta1)
        frame.insights_meta.objects_meta.append(object_meta2)



class ObjectDetectionModelObject(BaseModel):
    bbox: Bbox
    confidence: float
    label: str


class ObjectDetectionModelResult(BaseModel):
    objects: List[ObjectDetectionModelObject]


class ObjectDetectionModel(Model):

    def __init__(self, model, confidence_lower=None, confidence_upper=None, max_images=None):
        super().__init__()
        self.model = model

    def process(self, frame):

        img = frame.image.image_pointer
        width = frame.image.properties.width
        height = frame.image.properties.height
        #FIXME fix the url
        res = requests.post(PredictModule.Url + '/predict/'+self.model, files={'file': img}, params={'width': width, 'height': height})

        #print(res)
        #print(res.json())

        res = ObjectDetectionModelResult(**res.json())

        for obj in res.objects:
            object_meta = ObjectMeta(label=obj.label, bbox=obj.bbox, confidence=obj.confidence, attributes=[])
            frame.insights_meta.objects_meta.append(object_meta)

            # FIXME send image to webmodule for train new models (according to confidence threshold)


class Classification(BaseModel):
    name: str
    label: str
    confidence: float


class ClassificationModelResult(BaseModel):
    classifications: List[Classification]


class ClassificationModel(Model):

    def __init__(self, model, confidence_lower=None, confidence_upper=None, max_images=None):
        super().__init__()
        self.model = model

    def process(self, frame):
        
        img = frame.image.image_pointer
        width = frame.image.properties.width
        height = frame.image.properties.height

    
        for object_meta in frame.insights_meta.objects_meta:
            x1 = int(object_meta.bbox.l * width)
            x2 = int( ( object_meta.bbox.l+ object_meta.bbox.w) * width )
            y1 = int( object_meta.bbox.t * height )
            y2 = int( ( object_meta.bbox.t+ object_meta.bbox.h) * height )
            cropped_img = img[x1:x2, y1:y2]

            res = requests.post(PredictModule.Url + '/predict/'+self.model, files={'file': cropped_img}, params={'width': x2-x1, 'height': y2-y1})
            res = ClassificationModelResult(**res.json())

            for classification in res.classifications:
                object_meta.attributes.append(
                    Attribute(
                        name=classification.name,
                        label=classification.label,
                        confidence=classification.confidence
                    )
                )   