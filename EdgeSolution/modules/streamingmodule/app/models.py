from typing import List

import requests
from pydantic import BaseModel

from core import Model
from frame import Frame, Bbox, ObjectMeta, Attribute
from common.voe_ipc import PredictModule
from common.voe_utils import upload_relabel_image

import time

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


RELABEL_INTERVAL = 10 #second

class ObjectDetectionModel(Model):

    def __init__(self, model, symphony_name, provider, confidence_lower=None, confidence_upper=None, max_images=None):
        super().__init__()
        self.model = model

        self.confidence_lower = confidence_lower
        self.confidence_upper = confidence_upper
        self.max_images = max_images
        self.symphony_name = symphony_name
        self.provider = provider

        self.is_relabel = False
        if (self.confidence_lower is not None) and \
            (self.confidence_upper is not None) and \
            (self.max_images is not None):
            self.is_relabel = True
            self.confidence_lower = float(self.confidence_lower) / 100
            self.confidence_upper = float(self.confidence_upper) / 100
            self.max_images = int(self.max_images)
        
        self.last_relabel = -1
        self.relabel_count = 0

    def process(self, frame):

        img = frame.image.image_pointer
        width = frame.image.properties.width
        height = frame.image.properties.height
        #FIXME fix the url
        try:
            res = requests.post(PredictModule.Url + '/predict/'+self.model, files={'file': img}, params={'width': width, 'height': height})
        except:
            return
        #print(res)
        #print(res.json())

        res = ObjectDetectionModelResult(**res.json())

        for obj in res.objects:

            x1 = max(0, obj.bbox.l)
            y1 = max(0, obj.bbox.t)
            x2 = min(1, obj.bbox.l + obj.bbox.w)
            y2 = min(1, obj.bbox.t + obj.bbox.h)

            
            bbox = Bbox(
                l=x1,
                t=y1,
                w=x2-x1,
                h=y2-y1,
            )


            object_meta = ObjectMeta(label=obj.label, bbox=obj.bbox, confidence=obj.confidence, attributes=[])
            frame.insights_meta.objects_meta.append(object_meta)

            # FIXME send image to webmodule for train new models (according to confidence threshold)
            if self.provider == 'customvision':
                if self.is_relabel and self.relabel_count < self.max_images:
                    if time.time() > self.last_relabel + RELABEL_INTERVAL:
                        if self.confidence_lower <= obj.confidence <= self.confidence_upper:
                            self.relabel_count += 1
                            self.last_relabel = time.time()
                            upload_relabel_image(self.symphony_name, img, [obj], self.max_images)
                       


class Classification(BaseModel):
    name: str
    label: str
    confidence: float


class ClassificationModelResult(BaseModel):
    classifications: List[Classification]


class Classification(BaseModel):
    name: str
    label: str
    confidence: float


class ClassificationModelResult(BaseModel):
    classifications: List[Classification]


class ClassificationModel(Model):


    def __init__(self, model, symphony_name, provider, confidence_lower=None, confidence_upper=None, max_images=None):
        super().__init__()
        self.model = model

    def process(self, frame):
        
        img = frame.image.image_pointer
        width = frame.image.properties.width
        height = frame.image.properties.height

    
        for object_meta in frame.insights_meta.objects_meta:

            x1 = max(0, int(object_meta.bbox.l * width))
            x2 = min(width-1, int( ( object_meta.bbox.l+ object_meta.bbox.w) * width ))
            y1 = max(0, int( object_meta.bbox.t * height ))
            y2 = min(height-1, int( ( object_meta.bbox.t+ object_meta.bbox.h) * height ))

            if x2-x1 <= 0 or y2-y1 <= 0: continue
            
            cropped_img = img[y1:y2, x1:x2].copy()
            cropped_h, cropped_w, _ = cropped_img.shape

            try:
                res = requests.post(PredictModule.Url + '/predict/'+self.model, files={'file': cropped_img}, params={'width': cropped_w, 'height': cropped_h})
            except:
                return
            #print(res, flush=True)

            res = ClassificationModelResult(**res.json())

            for classification in res.classifications:
                object_meta.attributes.append(
                    Attribute(
                        name=classification.name,
                        label=classification.label,
                        confidence=classification.confidence
                    )
                )   
