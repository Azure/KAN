# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

from typing import List

import requests
from pydantic import BaseModel

from node import Model
from frame import Frame, Bbox, ObjectMeta, Attribute
#from common.voe_ipc import PredictModule
from predict_module import predict_module
from common.voe_utils import upload_relabel_image

from core import ObjectDetectionResult, ClassificationResult

import cv2
import base64
import requests
import time
import os
import json

class FakeModel(Model):
    def process(self, frame):

        fake_bbox1 = Bbox(l=0.1, t=0.1, w=0.1, h=0.1)
        object_meta1 = ObjectMeta(label='person', bbox=fake_bbox1, confidence=0.5)

        fake_bbox2 = Bbox(l=0.4, t=0.4, w=0.1, h=0.1)
        object_meta2 = ObjectMeta(label='cat', bbox=fake_bbox2, confidence=0.9)

        frame.insights_meta.objects_meta.append(object_meta1)
        frame.insights_meta.objects_meta.append(object_meta2)



#class ObjectDetectionModelObject(BaseModel):
#    bbox: Bbox
#    confidence: float
#    label: str


#class ObjectDetectionModelResult(BaseModel):
#    objects: List[ObjectDetectionModelObject]


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

        # FIXME should resize according to model input size
        #img_to_predict = cv2.resize(frame.image.image_pointer, (300, 300))

        #FIXME fix the url
        #try:
        #    res = requests.post(PredictModule.Url + '/predict/'+self.model, files={'file': img_to_predict}, params={'width': 300, 'height': 300})
        #    if res.status_code != 200:
        #        print('failed to send the image to predict module', flush=True)
        #        return
        #except:
        #    return 

        img = frame.image.image_pointer
        width = frame.image.properties.width
        height = frame.image.properties.height
        
        res = predict_module.predict(self.model, img)
        
        

        #print(res)
        #print(res.json())
        #try:
        #    res = ObjectDetectionModelResult(**res.json())
        #except:
        #    return
        for obj in res.objects:

            x1 = max(0, obj.bbox.l)
            y1 = max(0, obj.bbox.t)
            x2 = min(1, obj.bbox.l + obj.bbox.w)
            y2 = min(1, obj.bbox.t + obj.bbox.h)

            
            n_bbox = Bbox(
                l=x1,
                t=y1,
                w=x2-x1,
                h=y2-y1,
            )

            # FIXME
            object_meta = ObjectMeta(timestamp=0, inference_id='0', label=obj.label, bbox=n_bbox, confidence=obj.confidence, attributes=[])
            frame.insights_meta.objects_meta.append(object_meta)

            # FIXME send image to webmodule for train new models (according to confidence threshold)
            if self.provider == 'customvision':
                if self.is_relabel and self.relabel_count < self.max_images:
                    if time.time() > self.last_relabel + RELABEL_INTERVAL:
                        if self.confidence_lower <= obj.confidence <= self.confidence_upper:
                            self.relabel_count += 1
                            self.last_relabel = time.time()
                            upload_relabel_image(self.symphony_name, img, [obj], self.max_images)
                       
#class Classification(BaseModel):
#    name: str
#    label: str
#    confidence: float


#class ClassificationModelResult(BaseModel):
#    classifications: List[Classification]

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

            #try:
            #    res = requests.post(PredictModule.Url + '/predict/'+self.model, files={'file': cropped_img}, params={'width': cropped_w, 'height': cropped_h})
            #except:
            #    return
            #print(res, flush=True)

            #res = ClassificationModelResult(**res.json())
            res = predict_module.predict(self.model, img)

            for classification in res.classifications:
                object_meta.attributes.append(
                    Attribute(
                        name=classification.name,
                        label=classification.label,
                        confidence=classification.confidence
                    )
                )   

class GPT4Model(Model):

    def __init__(self, model, symphony_name, provider, confidence_lower=None, confidence_upper=None, max_images=None):
        super().__init__()
        self.model = model

        self.confidence_lower = confidence_lower
        self.confidence_upper = confidence_upper
        self.max_images = max_images
        self.symphony_name = symphony_name
        self.provider = provider

        self.last_timestamp = 0

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
        if len(frame.insights_meta.objects_meta) < 2:
            frame.insights_meta.objects_meta = []
            return

        frame.insights_meta.objects_meta = []

        current_timestamp = time.time()
        if current_timestamp < self.last_timestamp + 10:
            return
        self.last_timestamp = current_timestamp

        img = frame.image.image_pointer
    
        api_key = os.getenv('OPENAI_API_KEY')

        if api_key is None:
            print('OPENAI_API_KEY is not set', flush=True)
            return
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }

        _, buffer = cv2.imencode('.jpg', img)
        base64_image = base64.b64encode(buffer).decode('utf-8') 

        payload = {
            "model": "gpt-4-vision-preview",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant designed to output JSON."},
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": 'Please provide analysis if an aggressive action is detected, with a confidence value between 0.0 and 1.0. The result should be a JSON with a label field set to "aggressive", "sports" or "performance" and a confidence field set to the confidence value only. THe crowd on picture need to appear to be excited before they are detected as aggressive. Including a bounding box named bbox that indicates where the aggression is in the picture, with "l", "t", "w", "h" fields normalized to 0.0 and 1.0. Empty JSON should be returned if no aggressive action is detected. Return JSON only. Don\'t return any additioanl texts, empty lines or spaces before or after JSON.'
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            "max_tokens": 300
        }

        response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
   
        try:
            response_json = response.json()
            content_str = response_json['choices'][0]['message']['content']
            try:
                content = json.loads(content_str)
                detected = False
                if 'label' in content and 'confidence' in content:
                    if content['label'] == 'aggressive' and 0.0 <= content['confidence'] <= 1.0:
                       if 'bbox' in content:
                            bbox = content['bbox']
                            if 'l' in bbox and 't' in bbox and 'w' in bbox and 'h' in bbox:
                                l = bbox['l']
                                t = bbox['t']
                                w = bbox['w']
                                h = bbox['h']
                                if 0.0 <= l <= 1.0 and 0.0 <= t <= 1.0 and 0.0 <= w <= 1.0 and 0.0 <= h <= 1.0:
                                    detected = True
                                    n_bbox = Bbox(l=l, t=t, w=w, h=h)
                                    object_meta = ObjectMeta(timestamp=0, inference_id='0', label='aggressive', bbox=n_bbox, confidence=content['confidence'], attributes=[])
                                    frame.insights_meta.objects_meta.append(object_meta)
            except json.JSONDecodeError:
                print('Error: JSONDecodeError', flush=True)
        except KeyError as e:
            print('Error:', e, flush=True)
      
    
       
