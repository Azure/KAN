from openvino.runtime import Core 
import numpy as np
import cv2

from core import ObjectDetectionModel, ObjectDetectionResult, Object, Bbox


ie = Core()
devices = ie.available_devices

# 1, 1, 200, 7
outputs = {
    'face-detection-retail-0004': {
        'labels': [None, 'face']
    },

    'person-detection-retail-0013': {
        'labels': [None, 'person']
    },

    'pedestrian-and-vehicle-detector-adas-0001': {
        'labels': [None, 'vehicle', 'pedestrian']
    }

}

class OpenVINOObjectDetectionModel(ObjectDetectionModel):

    def __init__(self, model_name):

        #FIXME download model if needed


        #model_xml = f'models/{model_name}/FP32/{model_name}.xml'

        model_xml = f'models/{model_name}/{model_name}.xml'
        model = ie.read_model(model=model_xml)

        self.labels = [None]
        if model_name in outputs:
            self.labels = outputs[model_name]['labels']

        device_name = 'CPU'
        if 'GPU' in ie.available_devices: device_name = 'GPU'

        self.model = ie.compile_model(model=model, device_name=device_name) #FIXME device_name from solution
        #FIXME do we need to release model while we re-deploy

        self.input = self.model.inputs[0]
        self.output = self.model.outputs[0]

        #self.dsize = (256, 256)
        #print(self.input)
        self.dsize = self.input.shape[2], self.input.shape[3]


    def _preprocess(self, image):

        resized_image = cv2.resize(image, dsize=self.dsize)
        input_data = np.expand_dims(np.transpose(resized_image, (2, 0, 1)), 0).astype(np.float32)

        #print(input_data.shape)

        return input_data


    def _postprocess(self, output_data, threshold):

        # result: [1, 1, 200, 7]
        # [image_id, label, conf, x_min, y_min, x_max, y_max]


        arr = output_data[self.output] 

        objects = []
        for _, label_index, confidence, x_min, y_min, x_max, y_max in arr[arr[:,:,:,2]>threshold]:
            #if confidence > 0.05: print(x_min, y_min, x_max, y_max)
            bbox = Bbox(l=x_min, t=y_min, w=x_max-x_min, h=y_max-y_min)
            label_index = int(label_index)
            #print(label_index, self.labels)
            if 0 < label_index < len(self.labels):
                label = self.labels[label_index]
                objects.append( Object(bbox=bbox, confidence=confidence, label=label) ) #FIXME find something better instead of just put face here

        return ObjectDetectionResult(objects=objects)
        



    def predict(self, image, threshold=0.03) -> ObjectDetectionResult:

        input_data = self._preprocess(image)
        output_data = self.model([input_data])
        result = self._postprocess(output_data, threshold)

        return result
        

if __name__ == '__main__':
    #m = OpenVINOObjectDetectionModel('person-detection-retail-0013')
    m = OpenVINOObjectDetectionModel('face-detection-retail-0004')
    import cv2
    #c = cv2.VideoCapture(0)
    #_, img = c.read()
    img = cv2.imread('willy.jpg')
    res = m.predict(img)

    h, w, _ = img.shape
    #print(res.objects)
    for obj in res.objects:
        #print(obj)
        if obj.confidence < 0.05: continue
        x1 = int(obj.bbox.l * w)
        x2 = int((obj.bbox.l + obj.bbox.w) * w)
        y1 = int(obj.bbox.t * h)
        y2 = int((obj.bbox.t + obj.bbox.h) * h)
        color = (0, 0, 255)
        thickness = 2
        print(obj.bbox.l, obj.bbox.t, obj.bbox.l+obj.bbox.w, obj.bbox.t+obj.bbox.h)
        print((x1, y1), (x2, y2))
        img = cv2.rectangle(img, (x1, y1), (x2, y2), color, thickness)
    
    cv2.imwrite('img.jpg', img)
