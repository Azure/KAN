from core import Export
import utils

import os
import time
import datetime
import cv2
from enum import Enum, auto
import threading
import subprocess

import httpx

from common.azure_utils import get_blob_client
from azure.iot.device import IoTHubModuleClient


class VideoSnippetStatus(str, Enum):
    WAITING = 'WAITING'
    RECORDING = 'RECORDING'
    EXPORTING = 'EXPORTING'    

class VideoSnippetExport(Export):
    def __init__(self, filename_prefix, recording_duration=1, insights_overlay=True, delay_buffer=1, module_name='',
                    instance_displayname='instance', skill_displayname='skill', device_displayname='device'):
        super().__init__()

        #FIXME
        if insights_overlay == 'false':
            insights_overlay = False
        elif insights_overlay == 'true':
            insights_overlay = True

        self.instance_displayname = instance_displayname
        self.skill_displayname = skill_displayname
        self.device_displayname = device_displayname


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

                basename_ori = f"{self.filename_prefix}-{datetime.datetime.fromtimestamp(time.time()).isoformat()}-ori.mp4"
                basename = f"{self.filename_prefix}-{datetime.datetime.fromtimestamp(time.time()).isoformat()}.mp4"

                local_filename_ori = f'/tmp/{basename_ori}'
                local_filename = f'/tmp/{basename}'
                blob_filename = f'video-snippet/{self.instance_displayname}/{self.skill_displayname}/{self.device_displayname}/{basename}'

                fourcc = cv2.VideoWriter_fourcc(*'MP4V')
                out = cv2.VideoWriter(local_filename_ori, fourcc, fps, (w, h))
                for img in self.imgs:
                    out.write(img)
                out.release()

                subprocess.check_output(f'ffmpeg -i {local_filename_ori} {local_filename}'.split())

                # Upload to azure blob storage's container
                print('uploading video snippet to blobstorage', flush=True)
                client = get_blob_client(blob_filename)
                with open(local_filename, 'rb') as f:
                    client.upload_blob(f)
                os.remove(local_filename_ori)
                os.remove(local_filename)

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


iot = IoTHubModuleClient.create_from_edge_environment()

class IothubExport(Export):
    def __init__(self, delay_buffer=6, **kwargs):
        super().__init__()
        self.delay_buffer = float(delay_buffer)
        
        self.last_timestamp = -1
         

    def process(self, frame):

        cur_timestamp = time.time()
        if cur_timestamp > self.last_timestamp + self.delay_buffer:

            #print('exporting to iothub')
            iot.send_message_to_output(frame.json(), 'metrics')
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


class HttpExportWithDelayBuffer(Export):
    
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

class HttpExport(Export):
    
    def __init__(self, url):  
        super().__init__()
        self.url = url


    def process(self, frame):
    
        print('send a request to ', self.url)
        try:
            httpx.post(self.url, json=frame.json())
        except httpx.RequestError as exc:
            print(f"An error occurred while requesting {exc.request.url!r}.")
    


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
