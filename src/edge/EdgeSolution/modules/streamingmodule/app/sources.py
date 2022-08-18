# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import time
import os
import cv2


from core import Source
from frame import Frame, Image, ImageProperties, ColorFormat

from common.symphony_agent_client import SymphonyAgentClient

client = SymphonyAgentClient()
instance_name = os.environ.get('INSTANCE')

class RtspSource(Source):
    def __init__(self, ip, fps=30):
        super().__init__()
        #self.cap = cv2.VideoCapture(0)
        self.ip = ip
        self.cap = cv2.VideoCapture(ip)
        self.fps_upperbound = max(0.001, float(fps))

        print(f'[RTSP Source] IP: {self.ip}', flush=True)
        print(f'[RTSP Source] FPS: {fps}', flush=True)

        self.last_timestamp = 0
        self.frame_interval_upperbound = 1 / self.fps_upperbound
        self.frame_id = 0

        # this is the real fps, frame interval
        # we set them as given upperbound and update while we have new data
        # we will count moving avg for frame interval, then inverse it as fps
        self.fps = self.fps_upperbound
        self.frame_interval = self.frame_interval_upperbound
        self.last_update_fps_timestamp = 0
        

    def next_frame(self):
        while True:
            b, image_pointer = self.cap.read()
            if b is False or image_pointer is None:
                print(f'failed to get image from {self.ip}')
                time.sleep(1)
            else:
                timestamp = time.time()
                if timestamp > self.last_timestamp + self.frame_interval_upperbound:

                    # we count moving avg for frame interval, then inverse it as fps
                    self.frame_interval = self.frame_interval * 7/8 + (timestamp-self.last_timestamp) * 1/8
                    self.fps = 1 / self.frame_interval

                    # update fps to symphony
                    if timestamp > self.last_update_fps_timestamp + 5:
                        client.post_instance_fps(instance_name, self.fps)
                        self.last_update_fps_timestamp = timestamp

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
