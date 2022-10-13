# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

from importlib.util import find_spec
if find_spec('common'):
    import sys
    sys.path.append('../../common')

from common.voe_ipc import PredictModuleSetting

import os
import subprocess


if find_spec('openvino_object_detection'):
    from openvino_object_detection import OpenVINOObjectDetectionModel
if find_spec('openvino_classification'):
    from openvino_classification import OpenVINOClassificationModel

from customvision_object_detection import CustomVisionObjectDetectionModel



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


def get_openvino_classification_model(name):

    if os.path.isdir(f'models/{name}'):
        print(f'model {name} already exists')
    else:
        print(f'Downloading {name} from openvino model zoo ...')
        download_folder = f'models/{name}'
        subprocess.check_output(f'bash downloaders/download_openvino_object_detection.sh {name} {download_folder}'.split())

    model = OpenVINOClassificationModel(name)

    return model

class PredictModule:

    def __init__(self):
        if not os.path.isdir('models'):
            os.mkdir('models')
        self.models = {}

    def set(self, settings: PredictModuleSetting):
        
        print('--> Start to download models')

        for model_config in settings.model_configs:

            if model_config.provider == 'customvision':
                if model_config.type == 'ObjectDetection':
                    model = get_customvision_object_detection_model(model_config.name, model_config.download_uri)
                    self.models[model_config.name] = model

            elif model_config.provider == 'modelzoo': 
                if model_config.executor == 'openvino':
                    if model_config.type == 'ObjectDetection':
                        model = get_openvino_object_detection_model(model_config.name)
                        #print('adding model_config', model_config.name)
                        self.models[model_config.name] = model

                    elif model_config.type == 'Classification':
                        model = get_openvino_classification_model(model_config.name)
                        #print('adding model_config', model_config.name)
                        self.models[model_config.name] = model

        print('--> Download finished')

    def predict(self, model_name, img):
        if model_name not in self.models:
            print("[ERROR] unknown model", model_name, flush=True)
            return None
        
        r = self.models[model_name].predict(img)
        
        return r

predict_module = PredictModule()