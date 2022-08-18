# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

from typing import List
import json
import base64
import requests

import cv2
import httpx
from pydantic import BaseModel


from common.env import WEBMODULE_URL


    
class Bbox(BaseModel):
    l: float
    t: float
    w: float
    h: float

class Object(BaseModel):
    bbox: Bbox
    confidence: float
    label: str

#class UploadInfo(BaseModel):
#    objects: List[Object]

def upload_relabel_image(symphony_model_name, img, objs, max_images):

    #FIXME
    if len(objs) == 0: return
    obj = Object(**(objs[0].dict()))

    height, width, _ = img.shape


    label = {
        'x1': (obj.bbox.l) * width,
        'x2': (obj.bbox.l + obj.bbox.w) * width,
        'y1': (obj.bbox.t) * height,
        'y2': (obj.bbox.t + obj.bbox.h) * height,
    }

    part_name = obj.label

    data = {
        'confidence': obj.confidence,
        'labels': json.dumps([label]),
        'part_name': part_name,
        'img': base64.b64encode(cv2.imencode('.jpg', img)[1].tobytes()), #FIXME
        'project_symphony_id': symphony_model_name,
        'max_images': max_images
    }

    requests.post(WEBMODULE_URL+'/api/deployments/upload_relabel_image', data=data)