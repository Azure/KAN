from core import Sink

import cv2

class ExportVideoSnippet(Sink):
    def process(self, frame):



        img = frame.image.image_pointer.copy()
        h, w, _ = img.shape

        for object_meta in frame.insights_meta.objects_meta:
            bbox = object_meta.bbox
            p1 = int(bbox.l * w), int(bbox.t * h)
            p2 = int((bbox.l+bbox.w) * w), int((bbox.t+bbox.h) * h)
            color = (0, 0, 255)
            thickness = 2

            cv2.rectangle(img, p1, p2, color, thickness)

            label = object_meta.label
            fontScale = 1
            font = cv2.FONT_HERSHEY_SIMPLEX
            org = p1[0], p1[1]-20
            thickness = 2
            color = (0, 0, 255)
            cv2.putText(img, label, org, font,
                   fontScale, color, thickness, cv2.LINE_AA)

            print('drawing')
        print('writing')
        cv2.imwrite('test.jpg', img)


