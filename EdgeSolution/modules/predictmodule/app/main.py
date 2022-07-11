import importlib
if not importlib.util.find_spec('common'):
    import sys
    sys.path.append('../../common')

from fastapi import FastAPI, File, UploadFile, BackgroundTasks
from pydantic import BaseModel
import subprocess

from openvino_object_detection import OpenVINOObjectDetectionModel
from customvision_object_detection import CustomVisionObjectDetectionModel

import threading
import numpy as np
import os

from common.voe_status import ModuleStatus, StatusEnum
from common.voe_ipc import PredictModule

from core import Result

app = FastAPI()

#model = OpenVINOObjectDetectionModel('face-detection-0200')

#@app.post('/')

if not os.path.isdir('models'):
    os.mkdir('models')

status = ModuleStatus()
status.set_waiting()
models = {}

@app.get('/status')
def get_status():
    return PredictModule.Status(status=status.get())


def get_customvision_object_detection_model(name, download_uri):
    if os.path.isdir(f'models/{name}'):
        print(f'model {name} already exists')
    else:
        print(f'Downloading {name} from {download_uri} ...')
        download_folder = f'models/{name}'
        subprocess.check_output(f'bash downloaders/download_customvision_object_detection.sh {download_uri} {download_folder}'.split())
    
    model = CustomVisionObjectDetectionModel(name)

    return model

def get_openvino_object_detection_model(name):

    if os.path.isdir(f'models/{name}'):
        print(f'model {name} already exists')
    else:
        print(f'Downloading {name} from openvino model zoo ...')
        download_folder = f'models/{name}'
        subprocess.check_output(f'bash downloaders/download_openvino_object_detection.sh {name} {download_folder}'.split())

    model = OpenVINOObjectDetectionModel(name)

    return model

def _set(settings: PredictModule.Setting):
    status.set_creating()
    print('--> Start to download models')

    for model_config in settings.model_configs:

        if model_config.provider == 'customvision':
            if model_config.type == 'ObjectDetection':
                model = get_customvision_object_detection_model(model_config.name, model_config.download_uri)
                models[model_config.name] = model

        elif model_config.provider == 'modelzoo': 
            if model_config.executor == 'openvino':
                if model_config.type == 'ObjectDetection':
                    model = get_openvino_object_detection_model(model_config.name)
                    #print('adding model_config', model_config.name)
                    models[model_config.name] = model

    print('--> Download finished')
    status.set_running()
    
    
@app.post('/set')
def set(settings: PredictModule.Setting, background_tasks: BackgroundTasks):
    
    background_tasks.add_task(_set, settings)
    
    return 'ok'

    
@app.post('/predict/{name}')
async def predict(name: str, file: UploadFile, width: int, height: int):
    if status.get() == StatusEnum.RUNNING:
        pass
    elif status.get() == StatusEnum.INIT or status.get() == StatusEnum.WAITING:
        return Result(status='failed', description='model not yet set')
    elif status.get() == StatusEnum.CREATING:
        return Result(status='failed', description='preparing models')
    else:
        raise Exception(f"unknown status {status.get()}")

    if name not in models:
        return Result(status='failed', description=f'unknown model {name}')
        
    #raw_image = await file.read()
    raw_image = await file.read()
    img = np.frombuffer(raw_image, np.uint8).reshape((height, width, 3))
    print('--> modes', models)
    print('-->', name)
    r = models[name].predict(img)
    return r
    #return 'ok'




