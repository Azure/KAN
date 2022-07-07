import cv2

from core import Source
from frame import Frame, Image, ImageProperties, ColorFormat



class RtspSource(Source):
    def __init__(self, ip):
        super().__init__()
        #self.cap = cv2.VideoCapture(0)
        self.cap = cv2.VideoCapture(ip)

    def next_frame(self):
        _, image_pointer = self.cap.read()
        #FIXME add some error handling

        #print(img)

        h, w, c = image_pointer.shape

        properties = ImageProperties(height=h, width=w, color_format=ColorFormat.BGR)

        image = Image(image_pointer=image_pointer, properties=properties)

        return Frame(image=image)
