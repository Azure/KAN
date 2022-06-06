from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel

from openvino_models import OpenVINOObjectDetectionModel

import numpy as np

app = FastAPI()

model = OpenVINOObjectDetectionModel('face-detection-0200')


@app.post('/predict')
async def predict(file: UploadFile, width: int, height: int):
    raw_image = await file.read()
    img = np.frombuffer(raw_image, np.uint8).reshape((height, width, 3))
    r = model.predict(img)
    return r




