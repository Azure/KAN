from openvino.runtime import Core 
import numpy as np
import cv2

from core import ObjectDetectionModel, ObjectDetectionResult, Object, Bbox


ie = Core()
devices = ie.available_devices


# for Intel Model Zoo with input [1, 3, 256, 256] and output [1, 1, 200, 7]
# Reference: https://docs.openvino.ai/latest/omz_models_model_face_detection_0200.html#doxid-omz-models-model-face-detection-0200
class OpenVINOObjectDetectionModel(ObjectDetectionModel):

    def __init__(self, model_name):

        #FIXME download model if needed

        model_xml = f'models/intel/{model_name}/FP32/{model_name}.xml'

        model = ie.read_model(model=model_xml)

        device_name = 'CPU'
        if 'GPU' in ie.available_devices: device_name = 'GPU'

        self.model = ie.compile_model(model=model, device_name=device_name) #FIXME device_name from solution
        #FIXME do we need to release model while we re-deploy

        self.input = self.model.inputs[0]
        self.output = self.model.outputs[0]

        self.dsize = (256, 256)


    def _preprocess(self, image):

        resized_image = cv2.resize(image, dsize=self.dsize)
        input_data = np.expand_dims(np.transpose(resized_image, (2, 0, 1)), 0).astype(np.float32)

        return input_data


    def _postprocess(self, output_data, threshold):

        # result: [1, 1, 200, 7]
        # [image_id, label, conf, x_min, y_min, x_max, y_max]

        arr = output_data[self.output] 

        objects = []
        for _, _, confidence, x_min, y_min, x_max, y_max in arr[arr[:,:,:,2]>threshold]:
            bbox = Bbox(l=x_min, t=y_min, w=x_max-x_min, h=y_max-y_min)
            objects.append( Object(bbox=bbox, confidence=confidence, label='face') ) #FIXME find something better instead of just put face here

        return ObjectDetectionResult(objects=objects)
        



    def predict(self, image, threshold=0.1) -> ObjectDetectionResult:

        input_data = self._preprocess(image)
        output_data = self.model([input_data])
        result = self._postprocess(output_data, threshold)

        return result
        

if __name__ == '__main__':
    m = OpenVINOObjectDetectionModel('face-detection-0200')
    import cv2
    c = cv2.VideoCapture(0)
    _, img = c.read()
    print(m.predict(img))
