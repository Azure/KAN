import onnxruntime as ort
import numpy as np
import cv2

from PIL import Image

from core import ObjectDetectionModel, ObjectDetectionResult, Object, Bbox
from customvision.onnxruntime_predict import ONNXRuntimeObjectDetection


class CustomVisionObjectDetectionModel(ObjectDetectionModel):

    def __init__(self, model_name):

        model_onnx = f'models/{model_name}/model.onnx'
        label_file = f'models/{model_name}/labels.txt'

        with open(label_file, 'r') as f:
            self.labels = [l.strip() for l in f.readlines()]

        self.model = ONNXRuntimeObjectDetection(model_onnx, self.labels)

    def _preprocess(self, image):

        image = cv2.resize(image, (416, 416))
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        pil_image = Image.fromarray(image)

        return pil_image


    def _postprocess(self, output_data, threshold):

        # result: [1, 1, 200, 7]
        # [image_id, label, conf, x_min, y_min, x_max, y_max]

        #arr = output_data[self.output] 

        #objects = []
        #for _, _, confidence, x_min, y_min, x_max, y_max in arr[arr[:,:,:,2]>threshold]:
        #    bbox = Bbox(l=x_min, t=y_min, w=x_max-x_min, h=y_max-y_min)
        #    objects.append( Object(bbox=bbox, confidence=confidence, label='face') ) #FIXME find something better instead of just put face here

        #return ObjectDetectionResult(objects=objects)
        #print(output_data)
        objects = []
        for obj in output_data:
            if obj['probability'] < threshold: continue
            bbox = Bbox(
                l=obj['boundingBox']['left'],
                t=obj['boundingBox']['top'],
                w=obj['boundingBox']['width'],
                h=obj['boundingBox']['height'],
            )
            objects.append( Object(bbox=bbox, confidence=obj['probability'], label=obj['tagName']))
        return ObjectDetectionResult(objects=objects)



    def predict(self, image, threshold=0.1) -> ObjectDetectionResult:

        input_data = self._preprocess(image)
        output_data = self.model.predict_image(input_data)
        result = self._postprocess(output_data, threshold)
        

        return result
        

if __name__ == '__main__':
    m = CustomVisionObjectDetectionModel('d')
    import cv2
    #c = cv2.VideoCapture(0)
    #_, img = c.read()
    img = cv2.imread('0.jpg')
    #cv2.imwrite('0.jpg', img)

    print(m.predict(img))
