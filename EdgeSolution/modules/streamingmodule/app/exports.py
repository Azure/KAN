from core import Export
import utils

import os
import time
import datetime
import cv2
from enum import Enum, auto
import threading

import httpx

from common.azure_utils import get_blob_client


class VideoSnippetStatus(str, Enum):
    WAITING = 'WAITING'
    RECORDING = 'RECORDING'
    EXPORTING = 'EXPORTING'    

class VideoSnippetExport(Export):
    def __init__(self, filename_prefix, recording_duration=1, insights_overlay=True, delay_buffer=1, module_name=''):
        super().__init__()

        #FIXME
        if insights_overlay == 'false':
            insights_overlay = False
        elif insights_overlay == 'true':
            insights_overlay = True


        self.filename_prefix = filename_prefix
        self.recording_duration = float(recording_duration)
        print('--> recoring duration', self.recording_duration, flush=True)
        self.insights_overlay = insights_overlay
        self.delay_buffer = float(delay_buffer) # in minutes        

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
                fps = len(self.imgs) / self.recording_duration
                h, w, _ = self.imgs[0].shape

                basename = f"{self.filename_prefix}-{datetime.datetime.fromtimestamp(time.time()).isoformat()}.avi"
                filename = f'/tmp/{basename}'
                
                fourcc = cv2.VideoWriter_fourcc(*'MJPG')
                out = cv2.VideoWriter(filename, fourcc, fps, (w, h))
                for img in self.imgs:
                    out.write(img)
                out.release()

                # Upload to azure blob storage's container
                print('uploading video snippet to blobstorage', flush=True)
                client = get_blob_client(basename)
                with open(filename, 'rb') as f:
                    client.upload_blob(f)
                os.remove(filename)

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
    def __init__(self, delay_buffer=6, **kwargs):
        super().__init__()
        self.delay_buffer = float(delay_buffer)
        
        self.last_timestamp = -1
         

    def process(self, frame):

        cur_timestamp = time.time()
        if cur_timestamp > self.last_timestamp + self.delay_buffer:

            #FIXME
            print('exporting to iothub')

            self.last_timestamp = cur_timestamp


class IotedgeExport(Export):
    def __init__(self, module_name, delay_buffer=6, **kwargs):
        super().__init__()
        self.delay_buffer = float(delay_buffer)
        self.module_name = module_name

        self.last_timestamp = -1


    def process(self, frame):
        cur_timestamp = time.time()
        if cur_timestamp > self.last_timestamp + self.delay_buffer:

            #FIXME
            print('exporting to iotedge', self.module_name)

            self.last_timestamp = cur_timestamp


class HttpExport(Export):
    
    def __init__(self, url, delay_buffer=6):
        super().__init__()
        self.delay_buffer = float(delay_buffer)

        self.last_timestamp = -1

        self.url = url


    def process(self, frame):
        cur_timestamp = time.time()
        if cur_timestamp > self.last_timestamp + self.delay_buffer:

            #FIXME
            print('send a request to ', self.url)
            try:
                httpx.post(self.url, json=frame.json())
            except httpx.RequestError as exc:
                print(f"An error occurred while requesting {exc.request.url!r}.")
            self.last_timestamp = cur_timestamp


class Cv2ImshowExport(Export):

    def __init__(self, insights_overlay=True):
        super().__init__()

        if insights_overlay == 'false':
            insights_overlay = False
        elif insights_overlay == 'true':
            insights_overlay = True


        self.insights_overlay = insights_overlay
    
    def process(self, frame):

        img = frame.image.image_pointer.copy()
        if self.insights_overlay:
            utils.insights_overlay(img, frame)

        cv2.imshow('Frame', img)
        cv2.waitKey(1)
