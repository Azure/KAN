from core import Export
import utils

import time
import datetime
import cv2
from enum import Enum, auto
import threading



class VideoSnippetStatus(str, Enum):
    WAITING = 'WAITING'
    RECORDING = 'RECORDING'
    EXPORTING = 'EXPORTING'    

class VideoSnippetExport(Export):
    def __init__(self, filename_prefix, recording_duration=1, insights_overlay=True, delay_buffer=1):
        super().__init__()

        self.filename_prefix = filename_prefix
        self.recording_duration = recording_duration
        self.insights_overlay = insights_overlay
        self.delay_buffer = delay_buffer # in minutes

        self.last_timestamp = -1

        self.status = VideoSnippetStatus.WAITING
        self.imgs = []
        self.exporting_thread = None


    def _append_image(self, frame):
        img = frame.image.image_pointer.copy()
        if self.insights_overlay:
            utils.insights_overlay(img, frame)
        self.imgs.append(img)


    def _export_video(self):

        def _export_video_func():

            if len(self.imgs) > 0:
                #FIXME fps
                fps = 30.0
                h, w, _ = self.imgs[0].shape

                filename = f"{self.filename_prefix}-{datetime.datetime.fromtimestamp(time.time())}.avi"

                fourcc = cv2.VideoWriter_fourcc(*'MJPG')
                out = cv2.VideoWriter(filename, fourcc, fps, (w, h))
                for img in self.imgs:
                    out.write(img)
                out.release()

                self.imgs = []

            self.status = VideoSnippetStatus.WAITING

        self.exporting_thread = threading.Thread(target=_export_video_func)
        self.exporting_thread.start()

        


    def process(self, frame):

        cur_timestamp = time.time()
        #print(len(self.imgs))

        # current logic is that we start recording while there's any objects is detected
        if self.status is VideoSnippetStatus.WAITING:
            if cur_timestamp > self.last_timestamp + self.delay_buffer*60:
                if len(frame.insights_meta.objects_meta) > 0:
                    
                    print('start recording')
                    self.status = VideoSnippetStatus.RECORDING
                    self.last_timestamp = cur_timestamp
                    self._append_image(frame)                    


        # if it's recording, check whether its duration is over; if so, process it
        elif self.status is VideoSnippetStatus.RECORDING:
            if cur_timestamp > self.last_timestamp + self.recording_duration:
                self.status = VideoSnippetStatus.EXPORTING
                self._export_video()
            else:
                self._append_image(frame)                    



class IothubExport(Export):
    def __init__(self, delay_buffer):
        super().__init__()
        self.delay_buffer = delay_buffer
        
        self.last_timestamp = -1
         

    def process(self, frame):

        cur_timestamp = time.time()
        if cur_timestamp > self.last_timestamp + self.delay_buffer:

            #FIXME
            print('exporting to iothub')

            self.last_timestamp = cur_timestamp


class IotedgeExport(Export):
    def __init__(self, delay_buffer, module_name):
        super().__init__()
        self.delay_buffer = delay_buffer
        self.module_name = module_name

        self.last_timestamp = -1


    def process(self, frame):
        cur_timestamp = time.time()
        if cur_timestamp > self.last_timestamp + self.delay_buffer:

            #FIXME
            print('exporting to iotedge', self.module_name)

            self.last_timestamp = cur_timestamp

