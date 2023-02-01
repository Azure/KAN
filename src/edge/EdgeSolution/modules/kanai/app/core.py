# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

from typing import List
from pydantic import BaseModel


class Bbox(BaseModel):
    l: float
    t: float
    w: float
    h: float


class Object(BaseModel):
    bbox: Bbox
    confidence: float
    label: str


class Result(BaseModel):
    status: str = 'ok'
    description: str = ''

class ObjectDetectionResult(BaseModel):
    objects: List[Object]



class Classification(BaseModel):
    name: str
    label: str
    confidence: float


class ClassificationResult(BaseModel):
    classifications: List[Classification]



class Model:
    def predict(self, image):
        raise NotImplementedError


class ObjectDetectionModel(Model):
    def predict(self, image) -> ObjectDetectionResult:
        raise NotImplementedError


class ClassificationModel:
    def predict(self, image) -> ClassificationResult:
        raise NotImplementedError
