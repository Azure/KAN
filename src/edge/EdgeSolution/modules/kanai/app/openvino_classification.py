# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

from lib2to3.pgen2.token import OP
from openvino.runtime import Core 
import numpy as np
import cv2

from core import ClassificationModel, Classification, ClassificationResult, Object, Bbox


ie = Core()
devices = ie.available_devices


OUTPUT_TYPE_FLOAT = 0
OUTPUT_TYPE_INTEGER_DIVIDED_BY_100 = 1
OUTPUT_TYPE_STRING = 2


outputs = {

    'emotions-recognition-retail-0003': {
        'prob_emotion': {
            'name': 'emotion',
            'type': OUTPUT_TYPE_STRING,
            'labels': ['neutral', 'happy', 'sad', 'surprise', 'anger']
        }
    },

    'age-gender-recognition-retail-0013': {
        'age_conv3': {
            'name': 'age',
            'type': OUTPUT_TYPE_INTEGER_DIVIDED_BY_100,
        },
        'prob': {
            'name': 'gender',
            'type': OUTPUT_TYPE_STRING,
            'labels': ['female', 'male']
        }
    }, 

    'vehicle-attributes-recognition-barrier-0039': {
        'color': {
            'name': 'color',
            'type': OUTPUT_TYPE_STRING,
            'labels': ['white', 'gray', 'yellow', 'red', 'green', 'blue', 'black']

        },
        'type': {
            'name': 'type',
            'type': OUTPUT_TYPE_STRING,
            'labels': ['car', 'bus', 'truck', 'van']
        }
    }


}




# for Intel Model Zoo with input [1, 3, 256, 256] and output [1, 1, 200, 7]
# Reference: https://docs.openvino.ai/latest/omz_models_model_face_detection_0200.html#doxid-omz-models-model-face-detection-0200
class OpenVINOClassificationModel(ClassificationModel):

    def __init__(self, model_name):

        #FIXME download model if needed


        #model_xml = f'models/{model_name}/FP32/{model_name}.xml'
        model_xml = f'models/{model_name}/{model_name}.xml'
        model = ie.read_model(model=model_xml)

        self.output_infos = None
        if model_name in outputs:
            self.output_infos = outputs[model_name]

        device_name = 'CPU'
        if 'GPU' in ie.available_devices: device_name = 'GPU'

        self.model = ie.compile_model(model=model, device_name=device_name) #FIXME device_name from solution
        #FIXME do we need to release model while we re-deploy

        self.input = self.model.inputs[0]
        self.outputs = self.model.outputs

        #self.dsize = (256, 256)
        self.dsize = self.input.shape[2], self.input.shape[3]


    def _preprocess(self, image):

        resized_image = cv2.resize(image, dsize=self.dsize)
        input_data = np.expand_dims(np.transpose(resized_image, (2, 0, 1)), 0).astype(np.float32)

        return input_data


    def _postprocess(self, output_data, threshold):

        # result: [1, 1, 200, 7]
        # [image_id, label, conf, x_min, y_min, x_max, y_max]

        #arr = output_data[self.output] 

        #label = arr.argmax()

        #objects = []
        #for _, _, confidence, x_min, y_min, x_max, y_max in arr[arr[:,:,:,2]>threshold]:
        #    bbox = Bbox(l=x_min, t=y_min, w=x_max-x_min, h=y_max-y_min)
        #    objects.append( Object(bbox=bbox, confidence=confidence, label='face') ) #FIXME find something better instead of just put face here

        #return ClassificationResult(
        #    classification=Classification(name='', label='')
        #)

        classifications = []

        if self.output_infos is None:
            return ClassificationResult(classifications=classifications)
        
        for output in self.outputs:
            output_name = list(output.names)[0]
            arr = output_data[output]

            if output_name in self.output_infos:
                output_info = self.output_infos[output_name]
                
                name = output_info['name']
                
                if output_info['type'] == OUTPUT_TYPE_FLOAT:
                    classifications.append(Classification(
                        name=name,
                        label=str(arr.flatten()[0]),
                        confidence=1.0
                    ))
                elif output_info['type'] == OUTPUT_TYPE_INTEGER_DIVIDED_BY_100:
                    classifications.append(Classification(
                        name=name,
                        label=str(int(arr.flatten()[0]*100)),
                        confidence=1.0
                    ))
                elif output_info['type'] == OUTPUT_TYPE_STRING:
                    label_index = arr.argmax()
                    if label_index < len(output_info['labels']):
                        classifications.append(Classification(
                            name=name,
                            label=output_info['labels'][label_index],
                            confidence=arr.flatten()[label_index],
                        ))
        return ClassificationResult(classifications=classifications)


    def predict(self, image, threshold=0.1) -> ClassificationResult:

        input_data = self._preprocess(image)
        output_data = self.model([input_data])
        result = self._postprocess(output_data, threshold)

        return result
        

if __name__ == '__main__':
    #m = OpenVINOClassificationModel('emotions-recognition-retail-0003')
    m = OpenVINOClassificationModel('age-gender-recognition-retail-0013')
    import cv2
    c = cv2.VideoCapture(0)
    _, img = c.read()
    print(m.predict(img))
