import time

import cv2


from core import Source
from frame import Frame, Image, ImageProperties, ColorFormat



class RtspSource(Source):
    def __init__(self, ip, fps=30):
        super().__init__()
        #self.cap = cv2.VideoCapture(0)
        self.ip = ip
        self.cap = cv2.VideoCapture(ip)
        self.fps = max(0.001, float(fps))

        print(f'[RTSP Source] IP: {self.ip}', flush=True)
        print(f'[RTSP Source] FPS: {self.fps}', flush=True)

        self.last_timestamp = 0
        self.frame_interval = 1 / self.fps
        self.frame_id = 0

    def next_frame(self):
        while True:
            b, image_pointer = self.cap.read()
            if b is False or image_pointer is None:
                print(f'failed to get image from {self.ip}')
                time.sleep(1)
            else:
                timestamp = time.time()
                if timestamp > self.last_timestamp + self.frame_interval:
                    self.last_timestamp = timestamp
                    break
        #FIXME add some error handling

        #print(image_pointer.shape)

        h, w, c = image_pointer.shape

        properties = ImageProperties(height=h, width=w, color_format=ColorFormat.BGR)

        image = Image(image_pointer=image_pointer, properties=properties)

        frame = Frame(image=image, timestamp=timestamp, frame_id=str(self.frame_id))

        self.frame_id += 1

        return frame
