# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

from node import Export
import utils

import os
import time
import datetime
import cv2
from enum import Enum, auto
import threading
import subprocess
import queue
import json

import httpx

from common.azure_utils import get_blob_client
from azure.iot.device import IoTHubModuleClient
from common.env import IOTEDGE_CONNECTION_STRING, INSTANCE
from common.voe_ipc import is_iotedge

import paho.mqtt.client as mqtt


class VideoSnippetStatus(str, Enum):
    WAITING = 'WAITING'
    RECORDING = 'RECORDING'
    EXPORTING = 'EXPORTING'


class VideoSnippetExport(Export):
    def __init__(self, filename_prefix, recording_duration=1, insights_overlay=True, delay_buffer=1, module_name='',
                 instance_displayname='instance', skill_displayname='skill', device_displayname='device'):
        super().__init__()

        # FIXME
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
        self.delay_buffer = float(delay_buffer)  # in minutes

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
                # FIXME fps
                fps = len(self.imgs) / self.recording_duration
                h, w, _ = self.imgs[0].shape

                # timestamp of (2100-01-01 - timestamp) * 1000
                ID = str(int((4102416000 - time.time()) * 1000))

                basename_ori = f"{self.filename_prefix}-{ID}-{datetime.datetime.fromtimestamp(time.time()).isoformat()}-ori.mp4"
                basename = f"{self.filename_prefix}-{ID}-{datetime.datetime.fromtimestamp(time.time()).isoformat()}.mp4"

                local_filename_ori = f'/tmp/{basename_ori}'
                local_filename = f'/tmp/{basename}'
                blob_filename = f'video-snippet/{self.instance_displayname}/{self.skill_displayname}/{self.device_displayname}/{basename}'

                fourcc = cv2.VideoWriter_fourcc(*'MP4V')
                out = cv2.VideoWriter(local_filename_ori, fourcc, fps, (w, h))
                for img in self.imgs:
                    out.write(img)
                out.release()

                subprocess.check_output(
                    ['ffmpeg', '-i', local_filename_ori, local_filename])

                # Upload to azure blob storage's container
                print(
                    'VideoSnippetExport: uploading video snippet to blobstorage', flush=True)
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
        # print(len(self.imgs))

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


# MQTT setup
mqtt_client = None

def on_connect(client: mqtt.Client, userdata, flags, rc, properties=None):
    print("connected", flush=True)


def mqtt_init(broker_address):
    global mqtt_client
    print("MQTT init")
    try:
        addr, port = broker_address.split(":")
        print(f"Connecting MQTT broker: {addr}:{port} for instance {INSTANCE}")
        mqtt_client = mqtt.Client(INSTANCE, protocol=5)
        mqtt_client.on_connect = on_connect

        mqtt_client.connect(addr, int(port), 60)
    except Exception as e:
        mqtt_client = None
        print(f"MQTT client error: {e}", flush=True)


def send_message(message):
    global mqtt_client
    if mqtt_client:
        # payload = json.dumps(message)
        payload = message
        mqtt_client.reconnect()
        mqtt_client.publish("mqttmessage", payload=payload)
        print("Sent message: " + payload)
    else:
        print("MQTT client not set.")

try:
    if IOTEDGE_CONNECTION_STRING:
        iot = IoTHubModuleClient.create_from_connection_string(
            IOTEDGE_CONNECTION_STRING)
    else:
        iot = IoTHubModuleClient.create_from_edge_environment()
except Exception as e:
    iot = None
    print(f"Iotedge config error: {e}", flush=True)


class IothubExport(Export):
    def __init__(self, delay_buffer=6, **kwargs):
        super().__init__()
        self.delay_buffer = float(delay_buffer)

        self.last_timestamp = -1

        self._export_q = queue.Queue(30)

        def _exporter():
            while True:
                j = self._export_q.get()
                try:
                    print('IotHubExport: send a message to metrics')
                    if iot:
                        iot.send_message_to_output(j, 'metrics')
                    else:
                        global mqtt_client
                        mqtt_init("mqtt.default.svc.cluster.local:1883")
                        send_message(j)
                except Exception as e:
                    print(
                        f"IotHubExport: An error occurred while sending message to metrics: {e}.")

        self._export_thread = threading.Thread(target=_exporter)
        self._export_thread.start()

    def process(self, frame):

        cur_timestamp = time.time()
        if cur_timestamp > self.last_timestamp + self.delay_buffer:

            if len(frame.insights_meta.objects_meta) > 0:
                if not self._export_q.full():
                    self._export_q.put(frame.json())
                else:
                    print(f'IotHubExport: drop result since queue is full', flush=True)
                self.last_timestamp = cur_timestamp

class MqttExport(Export):
    def __init__(self, delay_buffer=6, broker_address="mqtt.default.svc.cluster.local:1883", **kwargs):
        super().__init__()
        mqtt_init(broker_address)
        self.delay_buffer = float(delay_buffer)

        self.last_timestamp = -1

        self._export_q = queue.Queue(30)

        def _exporter():
            while True:
                j = self._export_q.get()
                try:
                    print('MqttExport: send a message to metrics')
                    send_message(j)
                except Exception as e:
                    print(
                        f"MqttExport: An error occurred while sending message to metrics: {e}.")

        self._export_thread = threading.Thread(target=_exporter)
        self._export_thread.start()

    def process(self, frame):

        cur_timestamp = time.time()
        if cur_timestamp > self.last_timestamp + self.delay_buffer:

            if len(frame.insights_meta.objects_meta) > 0:
                if not self._export_q.full():
                    self._export_q.put(frame.json())
                else:
                    print(f'MqttExport: drop result since queue is full', flush=True)
                self.last_timestamp = cur_timestamp


class IotedgeExport(Export):
    def __init__(self, module_name, delay_buffer=6, **kwargs):
        super().__init__()
        self.delay_buffer = float(delay_buffer)
        self.module_name = module_name

        self.last_timestamp = -1

        self._export_q = queue.Queue(30)

        def _exporter():
            while True:
                j = self._export_q.get()
                try:
                    print('IotEdgeExport: send a message to localmetrics')
                    iot.send_message_to_output(j, 'localmetrics')
                except Exception as e:
                    print(
                        f"IotEdgeExport: An error occurred while sending message to localmetrics: {e}.")

        self._export_thread = threading.Thread(target=_exporter)
        self._export_thread.start()

    def process(self, frame):
        cur_timestamp = time.time()
        if cur_timestamp > self.last_timestamp + self.delay_buffer:

            if len(frame.insights_meta.objects_meta) > 0:
                if not self._export_q.full():
                    self._export_q.put(frame.json())
                else:
                    print(f'IotEdgeExport: drop result since queue is full', flush=True)
                self.last_timestamp = cur_timestamp


class HttpExport(Export):

    def __init__(self, url):
        super().__init__()
        self.url = url

        self._export_q = queue.Queue(30)

        def _exporter():
            while True:
                j = self._export_q.get()
                try:
                    print('HttpExport: send a request to ', self.url)
                    httpx.post(self.url, json=j)
                except httpx.RequestError as exc:
                    print(
                        f"An error occurred while requesting {exc.request.url!r}.")

        self._export_thread = threading.Thread(target=_exporter)
        self._export_thread.start()

    def process(self, frame):

        if not self._export_q.full():
            self._export_q.put(frame.json())
        else:
            print(f'HttpExport: drop result since queue is full', flush=True)


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
