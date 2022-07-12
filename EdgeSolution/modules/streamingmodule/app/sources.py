import time

import cv2


from core import Source
from frame import Frame, Image, ImageProperties, ColorFormat



class RtspSource(Source):
    def __init__(self, ip):
        super().__init__()
        #self.cap = cv2.VideoCapture(0)
        self.ip = ip
        self.cap = cv2.VideoCapture(ip)
        print('->', ip)

    def next_frame(self):
        while True:
            b, image_pointer = self.cap.read()
            if b is False or image_pointer is None:
                print(f'failed to get image from {ip}')
                time.sleep(1)
            else:
                break
        #FIXME add some error handling

        print(image_pointer.shape)

        h, w, c = image_pointer.shape

        properties = ImageProperties(height=h, width=w, color_format=ColorFormat.BGR)

        image = Image(image_pointer=image_pointer, properties=properties)

        return Frame(image=image)
