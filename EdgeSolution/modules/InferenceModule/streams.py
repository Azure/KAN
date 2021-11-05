import asyncio
import base64
import json
import logging
import os
import threading
import time
import socket

import cv2
import numpy as np
import requests
from io import BytesIO, BufferedReader
from azure.iot.device import IoTHubModuleClient, Message
from shapely.geometry import Polygon

from api.models import StreamModel
from exception_handler import PrintGetExceptionDetails
from invoke import gm

# from tracker import Tracker
from scenarios import DangerZone, DefeatDetection, Detection, PartCounter, PartDetection, ShelfZone, CountingZone, QueueZone
from utility import draw_label, get_file_zip, is_edge, normalize_rtsp

# for grpc
import grpc
import datetime
from tensorflow import make_tensor_proto, make_ndarray
from tensorflow_serving.apis import predict_pb2
from tensorflow_serving.apis import prediction_service_pb2_grpc
from ovms_utils import load_classes, postprocess
from yolo_utils import yolo_eval

DETECTION_TYPE_NOTHING = "nothing"
DETECTION_TYPE_SUCCESS = "success"
DETECTION_TYPE_UNIDENTIFIED = "unidentified"
DETECTION_BUFFER_SIZE = 10000

# for Retraining
UPLOAD_INTERVAL = 5

LVA_MODE = os.environ.get("LVA_MODE", "grpc")
IS_OPENCV = os.environ.get("IS_OPENCV", "false")
IS_K8S = os.environ.get("IS_K8S", "false")
IOTEDGE_DEVICE_CONNECTION_STRING = os.environ.get(
    "IOTEDGE_DEVICE_CONNECTION_STRING", "false")

DISPLAY_KEEP_ALIVE_THRESHOLD = 10  # seconds

try:
    if IS_K8S == "true":
        iot = IoTHubModuleClient.create_from_connection_string(
            IOTEDGE_DEVICE_CONNECTION_STRING)
    else:
        iot = IoTHubModuleClient.create_from_edge_environment()
except:
    iot = None

logger = logging.getLogger(__name__)


class Stream:
    def __init__(
        self,
        cam_id,
        model,
        sender,
        cam_type="video_file",
        cam_source="./sample_video/video.mp4",
        send_video_to_cloud: bool = False,
    ):
        self.name = ''
        self.cam_id = cam_id
        self.model = model
        self.send_video_to_cloud = send_video_to_cloud
        self.send_video_to_cloud_threshold = 60
        self.send_video_to_cloud_parts = []
        self.recording_duration = 60

        self.render = False

        self.mutex = threading.Lock()

        self.cam_type = cam_type
        self.cam_source = None
        if self.model.is_gpu:
            self.frameRate = 30
        else:
            self.frameRate = 10
        # self.cam = cv2.VideoCapture(normalize_rtsp(cam_source))
        self.cam_is_alive = True
        self.last_display_keep_alive = None

        self.IMG_WIDTH = 960
        self.IMG_HEIGHT = 540
        self.image_shape = [540, 960]

        self.last_img = None
        self.last_recv_img = None
        # self.last_edge_img = None
        self.last_drawn_img = None
        self.last_prediction = []
        self.last_prediction_lva = []
        self.last_prediction_count = {}

        self.is_retrain = False
        self.confidence_min = 30 * 0.01
        self.confidence_max = 80 * 0.01
        self.max_images = 10
        self.last_upload_time = 0
        # self.is_upload_image = False
        # self.current_uploaded_images = {}
        self.edge = '960'

        self.detection_success_num = 0
        self.detection_unidentified_num = 0
        self.detection_total = 0
        self.detections = []

        self.threshold = 0.3
        self.max_people = 5

        self.has_aoi = False
        self.aoi_info = None
        # Part that we want to detect
        self.parts = []

        # self.is_gpu = (onnxruntime.get_device() == 'GPU')
        self.average_inference_time = 0
        self.counter = {}

        # IoT Hub
        self.iothub_is_send = False
        self.iothub_threshold = 0.5
        self.iothub_fpm = 0
        self.iothub_last_send_time = time.time()
        self.iothub_interval = 99999999

        # lva signal
        self.lva_last_send_time = time.time()
        self.lva_interval = 10
        self.lva_mode = LVA_MODE

        self.zmq_sender = sender
        self.last_update = 0
        self.last_send = 0
        self.use_line = False
        self.use_zone = False
        # self.tracker = Tracker()
        self.scenario = None
        self.scenario_type = None
        # self.start_zmq()
        self.is_benchmark = False
        self.use_tracker = False
        self.stub = None
        self.cascade_name = None

    def set_is_benchmark(self, is_benchmark):
        self.is_benchmark = is_benchmark

    def _stop(self):
        gm.invoke_graph_instance_deactivate(self.cam_id)

    def _set(self, rtspUrl, frameRate, recording_duration):
        gm.invoke_instance_set(self.lva_mode, self.cam_id, rtspUrl, frameRate,
                               recording_duration)

    def _start(self):
        gm.invoke_graph_instance_activate(self.cam_id)

    def reset_metrics(self):
        # self.mutex.acquire()
        self.detection_success_num = 0
        self.detection_unidentified_num = 0
        self.detection_total = 0
        self.detections = []
        self.use_tracker = False
        # self.last_prediction_count = {}
        if self.scenario:
            self.scenario.reset_metrics()
        # self.mutex.release()

    def start_zmq(self):
        def run(self):

            while "flags" not in dir(self.last_drawn_img):
                logger.info("not sending last_drawn_img")
                time.sleep(2)
            cnt = 0
            while self.cam_is_alive:

                if self.last_send == self.last_update:
                    time.sleep(0.03)
                    continue
                cnt += 1
                if cnt % 30 == 1:
                    logging.info("send through channel {}".format(
                        bytes(self.cam_id, "utf-8")))
                # self.mutex.acquire()
                # FIXME may find a better way to deal with encoding
                self.zmq_sender.send_multipart([
                    bytes(self.cam_id, "utf-8"),
                    cv2.imencode(".jpg", self.last_drawn_img)[1].tobytes(),
                ])
                self.last_send = self.last_update
                # self.mutex.release()
                # FIXME need to fine tune this value
                time.sleep(0.03)

        threading.Thread(target=run, args=(self, )).start()

    def get_scenario_metrics(self):
        if self.scenario:
            return self.scenario.get_metrics()
        return []

    def restart_cam(self):

        logger.warning("[INFO] Restarting Cam")

        # cam = cv2.VideoCapture(normalize_rtsp(self.cam_source))

        # Protected by Mutex
        # self.mutex.acquire()
        self.scenario = PartCounter()
        self.scenario_type = self.model.detection_mode
        # self.cam.release()
        # self.cam = cam
        # self.mutex.release()

    def update_cam(
        self,
        cam_type,
        cam_source,
        frameRate,
        recording_duration,
        lva_mode,
        cam_id,
        cam_name,
        has_aoi,
        aoi_info,
        scenario_type=None,
        line_info=None,
        zone_info=None,
    ):
        logger.info("Updating Cam ...")

        # if self.cam_type == cam_type and self.cam_source == cam_source:
        #    return
        if (self.cam_source != cam_source
                or round(self.frameRate) != round(frameRate)
                or self.lva_mode != lva_mode
                or self.recording_duration != recording_duration):
            self.cam_source = cam_source
            self.frameRate = frameRate
            self.lva_mode = lva_mode
            self.recording_duration = recording_duration
            if IS_OPENCV == "true":
                logger.info("post to CVModule")
                data = {
                    "stream_id": self.cam_id,
                    "rtsp": self.cam_source,
                    "fps": self.frameRate,
                    "endpoint": "http://inferencemodule:5000",
                }
                res = requests.post("http://cvcapturemodule:9000/streams",
                                    json=data)
            else:
                self._update_instance(normalize_rtsp(cam_source),
                                      str(frameRate), str(recording_duration))

        self.name = cam_name
        self.has_aoi = has_aoi
        self.aoi_info = aoi_info

        detection_mode = self.model.get_detection_mode()
        if detection_mode == "PD":
            self.scenario = PartDetection()
            self.scenario.set_parts(self.model.parts)
            self.scenario_type = self.model.detection_mode

        elif detection_mode == "PC":
            logger.warning("[INFO] Line INFO: {}".format(line_info))
            self.scenario = PartCounter()
            self.scenario_type = self.model.detection_mode
            try:
                line_info = json.loads(line_info)
                self.use_line = line_info["useCountingLine"]
                lines = line_info["countingLines"]
                lines_to_set = []
                if len(lines) > 0:
                    for i in range(len(lines)):
                        x1 = int(lines[i]["label"][0]["x"])
                        y1 = int(lines[i]["label"][0]["y"])
                        x2 = int(lines[i]["label"][1]["x"])
                        y2 = int(lines[i]["label"][1]["y"])
                        line_id = str(lines[i]['order'])
                        logger.warning("        line: {} {} {} {} {}".format(x1, y1, x2, y2,
                                       line_id))
                        lines_to_set.append([x1, y1, x2, y2, line_id])
                    self.scenario.set_line(lines_to_set)
                    logger.warning("Upading Line:")
                    logger.warning("    use_line: {}".format(self.use_line))
                else:
                    logger.warning("Upading Line:")
                    logger.warning("    use_line: {}".format(self.use_line))

            except:
                self.use_line = False
                logger.warning("Upading Line[*]:")
                logger.warning("    use_line   {}:".format(False))

        elif detection_mode in ["ES", "ESA", "TCC", "CQA"]:
            class_obj = [DangerZone, ShelfZone, CountingZone, QueueZone]
            logger.warning("[INFO] Zone INFO: {}".format(zone_info))
            self.scenario = class_obj[["ES", "ESA", "TCC",
                                       "CQA"].index(detection_mode)]()
            self.scenario_type = self.model.detection_mode
            # FIXME
            self.scenario.set_targets(self.model.parts)
            try:
                zone_info = json.loads(zone_info)
                self.use_zone = zone_info["useDangerZone"]
                zones = zone_info["dangerZones"]
                _zones = []
                logger.warning("Upading Line:")
                logger.warning("    use_zone: {}".format(self.use_zone))
                # for zone in zones:
                #     x1 = int(zone["label"]["x1"])
                #     y1 = int(zone["label"]["y1"])
                #     x2 = int(zone["label"]["x2"])
                #     y2 = int(zone["label"]["y2"])
                #     zone_id = str(zone['order'])
                #     _zones.append([x1, y1, x2, y2, zone_id])
                #     logger.warning("     zone:", x1, y1, x2, y2 )
                # self.scenario.set_zones(_zones)
                self.scenario.set_zones(zones)

            except:
                self.use_zone = False
                logger.warning("Upading Zone[*]:")
                logger.warning("    use_zone   {}:".format(False))

        elif detection_mode == "DD":
            logger.warning("[INFO] : {}".format(line_info))
            self.scenario = DefeatDetection()
            self.scenario_type = self.model.detection_mode
            # FIXME
            self.scenario.set_ok("Bottle - OK")
            self.scenario.set_ng("Bottle - NG")
            try:
                line_info = json.loads(line_info)
                self.use_line = line_info["useCountingLine"]
                lines = line_info["countingLines"]
                if len(lines) > 0:
                    x1 = int(lines[0]["label"][0]["x"])
                    y1 = int(lines[0]["label"][0]["y"])
                    x2 = int(lines[0]["label"][1]["x"])
                    y2 = int(lines[0]["label"][1]["y"])
                    self.scenario.set_line(x1, y1, x2, y2)
                    logger.warning("Upading Line:")
                    logger.warning("    use_line: {}".format(self.use_line))
                    logger.warning("        line: {} {} {} {}".format(
                        x1, y1, x2, y2))
                else:
                    logger.warning("Upading Line:")
                    logger.warning("    use_line: {}".format(self.use_line))

            except:
                self.use_line = False
                logger.warning("Upading Line[*]:")
                logger.warning("    use_line   : {}".format(False))

        else:
            self.scenario = None
            self.scenario_type = self.model.detection_mode

    def get_mode(self):
        return self.model.detection_mode

    def update_detection_status(self, predictions):
        # self.mutex.acquire()

        detection_type = DETECTION_TYPE_NOTHING
        for prediction in predictions:
            if detection_type != DETECTION_TYPE_SUCCESS:
                if prediction["probability"] >= self.threshold:
                    detection_type = DETECTION_TYPE_SUCCESS
                    break
                else:
                    detection_type = DETECTION_TYPE_UNIDENTIFIED

        if detection_type == DETECTION_TYPE_NOTHING:
            pass
        else:
            if self.detection_total == DETECTION_BUFFER_SIZE:
                oldest_detection = self.detections.pop(0)
                if oldest_detection == DETECTION_TYPE_UNIDENTIFIED:
                    self.detection_unidentified_num -= 1
                elif oldest_detection == DETECTION_TYPE_SUCCESS:
                    self.detection_success_num -= 1

                self.detections.append(detection_type)
                if detection_type == DETECTION_TYPE_UNIDENTIFIED:
                    self.detection_unidentified_num += 1
                elif detection_type == DETECTION_TYPE_SUCCESS:
                    self.detection_success_num += 1
            else:
                self.detections.append(detection_type)
                if detection_type == DETECTION_TYPE_UNIDENTIFIED:
                    self.detection_unidentified_num += 1
                elif detection_type == DETECTION_TYPE_SUCCESS:
                    self.detection_success_num += 1
                self.detection_total += 1

        # self.mutex.release()

    def _update_instance(self, rtspUrl, frameRate, recording_duration):
        if not self.is_benchmark:
            self._stop()
            self._set(rtspUrl, frameRate, recording_duration)
            self._start()
        logger.info(
            "Instance {} updated, rtsp = {}, frameRate = {}, recording_duration = {}"
            .format(self.cam_id, rtspUrl, frameRate, recording_duration))

    def update_retrain_parameters(self, is_retrain, confidence_min,
                                  confidence_max, max_images):
        self.is_retrain = is_retrain
        self.max_images = max_images
        # FIMXE may need to move it to other place
        self.threshold = self.confidence_max
        self.confidence_min = confidence_min
        self.confidence_max = confidence_max

    def update_iothub_parameters(self, is_send, threshold, fpm):
        self.iothub_is_send = is_send
        self.iothub_threshold = threshold
        self.iothub_fpm = fpm
        self.iothub_last_send_time = time.time()
        if fpm == 0:
            self.iothub_is_send = 0
            self.iothub_interval = 99999999
        else:
            self.iothub_interval = 60 / fpm  # seconds

    def update_lva_mode(self, lva_mode):
        if lva_mode == self.lva_mode:
            logger.info("Not changing lva_mode.")
        else:
            self._stop()
            self.lva_mode = lva_mode
            self._set(self.cam_source, self.frameRate, self.recording_duration)
            self._start()
            logger.info("Change lva_mode to {}".format(lva_mode))

    def delete(self):
        # self.mutex.acquire()
        self.cam_is_alive = False
        # self.mutex.release()

        if IS_OPENCV == "true":
            logger.info("get CVModule")
            res = requests.get("http://cvcapturemodule:9000/delete_stream/" +
                               self.cam_id)
        else:
            gm.invoke_graph_instance_deactivate(self.cam_id)
        logger.info("Deactivate stream {}".format(self.cam_id))

    def predict(self, image):

        width = self.IMG_WIDTH
        ratio = self.IMG_WIDTH / image.shape[1]
        height = int(image.shape[0] * ratio + 0.000001)
        if height >= self.IMG_HEIGHT:
            height = self.IMG_HEIGHT
            ratio = self.IMG_HEIGHT / image.shape[0]
            width = int(image.shape[1] * ratio + 0.000001)
            self.edge = '540'

        # prediction
        # self.mutex.acquire()
        # predictions, inf_time = self.model.Score(image)
        if ':7777/predict' in self.model.endpoint.lower():
            image = cv2.resize(image, (width, height))
            data = image.tobytes()
            endpoint = self.model.endpoint + "?edge=" + self.edge
            res = requests.post(endpoint, data=data)
            # logger.warning(res.json())
            if res.json()[1] == 200:
                lva_prediction = json.loads(res.json()[0])['inferences']
                inf_time = json.loads(res.json()[0])['inf_time']
                predictions = lva_to_customvision_format(lva_prediction)
            else:
                logger.warning('No inference result')
                predictions = []
                inf_time = 0
        elif ':5010/score' in self.model.endpoint.lower():
            # for ovms enpoint testing
            str_encode = cv2.imencode('.jpg', image)[1].tostring()
            f4 = BytesIO(str_encode)
            f5 = BufferedReader(f4)
            s = time.time()
            res = requests.post(self.model.endpoint, data=f5)
            inf_time = time.time() - s
            # logger.warning(res.json())
            if res.status_code == 200:
                lva_prediction = res.json()['inferences']
                predictions = lva_to_customvision_format(lva_prediction)
            else:
                logger.warning('No inference result')
                predictions = []
            logger.warning('request prediction time: {}'.format(inf_time))
        elif 'ovmsdag' in self.model.endpoint.lower():
            args = {}
            args["grpc_address"] = "ovmsdag"
            args["grpc_port"] = 9111
            args["pipeline_name"] = "find_face_images"
            args["image_width"] = 600
            args["image_height"] = 400
            args["image_input_name"] = "image"
            args["image_input_path"] = "./img/images-6.jpg"
            args["input_image_layout"] = "NHWC"

            if not self.stub:
                address = "{}:{}".format(args['grpc_address'],
                                         args['grpc_port'])
                MAX_MESSAGE_LENGTH = 1024 * 1024 * 1024
                channel = grpc.insecure_channel(
                    address,
                    options=[
                        ('grpc.max_send_message_length', MAX_MESSAGE_LENGTH),
                        ('grpc.max_receive_message_length',
                         MAX_MESSAGE_LENGTH),
                    ])

                self.stub = prediction_service_pb2_grpc.PredictionServiceStub(
                    channel)
            request = predict_pb2.PredictRequest()
            request.model_spec.name = args['pipeline_name']

            self.last_img = image
            img = self.last_img.copy()
            img = img.astype(np.float32)
            img = cv2.resize(img, (600, 400))
            target_shape = (img.shape[0], img.shape[1])
            img = img.reshape(1, target_shape[0], target_shape[1], 3)
            request.inputs['image'].CopyFrom(
                make_tensor_proto(img, shape=img.shape))

            try:
                result_future = stub.Predict.future(request, 30.0)
                response = result_future.result()
            except grpc.RpcError as err:
                if err.code() == grpc.StatusCode.ABORTED:
                    logger.warning('No face has been found in the image')
                    return
                else:
                    raise err
            people = []

            for name in response.outputs:
                logger.warning(f"Output: name[{name}]")
                tensor_proto = response.outputs[name]
                output_nd = make_ndarray(tensor_proto)
                logger.warning(
                    f"    numpy => shape[{output_nd.shape}] data[{output_nd.dtype}]"
                )

                if name == 'ages':
                    people = update_people_ages(output_nd, people)
                if name == 'genders':
                    people = update_people_genders(output_nd, people)
                if name == 'emotions':
                    people = update_people_emotions(output_nd, people)
                if name == 'face_coordinates':
                    people = update_people_coordinate(output_nd, people)

            img = self.last_img.copy()
            h, w, _ = img.shape
            for person in people:
                x1, y1, x2, y2 = person['coordinate']
                x1 = int(x1 * w)
                x2 = int(x2 * w)
                y1 = int(y1 * h)
                y2 = int(y2 * h)
                cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 255), 3)
                font = cv2.FONT_HERSHEY_SIMPLEX
                fontScale = 0.5
                color = (0, 255, 255)
                thickness = 1
                text = person['gender'] + ' / ' + str(
                    person['age']) + '/' + person['emotion']
                cv2.putText(img, text, (x1, y1 - 10), font, fontScale, color,
                            thickness, cv2.LINE_AA)

            self.last_prediction_count = len(people)
            self.last_prediction = np.array(people).tolist()
            self.last_drawn_img = img
            self.last_update = time.time()
            return
        elif "ovmsserver" in self.model.endpoint.lower():
            if not self.stub:
                address = self.model.endpoint.lower()
                if 'http://' in address:
                    address = address[7:]
                MAX_MESSAGE_LENGTH = 1024 * 1024 * 1024
                channel = grpc.insecure_channel(
                    address,
                    options=[
                        ('grpc.max_send_message_length', MAX_MESSAGE_LENGTH),
                        ('grpc.max_receive_message_length',
                         MAX_MESSAGE_LENGTH),
                    ])

                self.stub = prediction_service_pb2_grpc.PredictionServiceStub(
                    channel)
            resized_image = cv2.resize(image, (416, 416))
            resized_image = resized_image
            self.predict_grpc(image, self.stub)

            if self.iothub_is_send:
                self.process_send_message_to_iothub(self.last_prediction)
 
            return
        else:
            # for yolo enpoint testing
            resized_image = cv2.resize(image, (416, 416))
            str_encode = cv2.imencode('.jpg', resized_image)[1].tostring()
            f4 = BytesIO(str_encode)
            f5 = BufferedReader(f4)
            s = time.time()
            res = requests.post(self.model.endpoint, data=f5)
            inf_time = time.time() - s
            logger.warning(res.json())
            if res.status_code == 200:
                lva_prediction = res.json()['inferences']
                predictions = lva_to_customvision_format(lva_prediction)
            else:
                logger.warning('No inference result')
                predictions = []
            logger.warning('request prediction time: {}'.format(inf_time))
        # logger.warning('predictions', predictions )
        # self.mutex.release()

        # check whether it's the tag we want
        predictions = list(p for p in predictions
                           if p["tagName"] in self.model.parts)

        # check whether it's inside aoi (if has)
        if self.has_aoi:
            _predictions = []
            for p in predictions:
                (x1, y1), (x2, y2) = parse_bbox(p, width, height)
                if is_inside_aoi(x1, y1, x2, y2, self.aoi_info):
                    _predictions.append(p)
            predictions = _predictions

        # update detection status before filter out by threshold
        self.update_detection_status(predictions)

        if self.is_retrain:
            self.process_retrain_image(predictions, image)

        # check whether it's larger than threshold
        predictions = list(p for p in predictions
                           if p["probability"] >= self.threshold)

        # update last_prediction_count
        _last_prediction_count = {}
        for p in predictions:
            tag = p["tagName"]
            if tag not in _last_prediction_count:
                _last_prediction_count[tag] = 1
            else:
                _last_prediction_count[tag] += 1
        self.last_prediction_count = _last_prediction_count

        # update the buffer
        # no need to copy since resize already did it
        self.last_img = image
        self.last_prediction = np.array(predictions).tolist()

        # FIXME support more scenarios
        # Update Tracker / Scenario
        _detections = []
        for prediction in predictions:
            tag = prediction["tagName"]
            # if prediction['probability'] > 0.5:
            (x1, y1), (x2, y2) = parse_bbox(prediction, width, height)
            _detections.append(
                Detection(tag, x1, y1, x2, y2, prediction["probability"]))
        if self.scenario:
            update_ret = self.scenario.update(_detections)
            if self.get_mode() in ['ES', 'DD', 'PC', 'TCC', 'CQA']:
                self.counter = update_ret[0]

        self.draw_img()

        if self.scenario:
            if (self.get_mode() in ["ES", "TCC", "CQA"] and self.use_zone
                    == True) or (self.get_mode() in ['DD', 'PD', 'PC']
                                 and self.use_line == True):
                self.scenario.draw_counter(self.last_drawn_img)
            if self.get_mode() == "ESA":
                self.scenario.draw_counter(self.last_drawn_img)
            if self.get_mode() == "DD":
                self.scenario.draw_objs(self.last_drawn_img)
            if self.get_mode() == 'PD' and self.use_tracker is True:
                self.scenario.draw_objs(self.last_drawn_img)

        if self.iothub_is_send:
            if self.get_mode() in ["ES", "ESA", "TCC", "CQA"]:
                if self.scenario.has_new_event:
                    self.process_send_message_to_iothub(predictions)
            else:
                self.process_send_message_to_iothub(predictions)

        if self.send_video_to_cloud:
            if self.get_mode() in ["ES", "ESA", "TCC", "CQA"]:
                if self.scenario.has_new_event:
                    self.precess_send_signal_to_lva()
            else:
                self.precess_send_signal_to_lva()

        # update avg inference time (moving avg)
        inf_time_ms = inf_time * 1000
        self.average_inference_time = (1 / 16 * inf_time_ms +
                                       15 / 16 * self.average_inference_time)

    def predict_grpc(self, image, stub):

        # width = self.IMG_WIDTH
        # ratio = self.IMG_WIDTH / image.shape[1]
        # height = int(image.shape[0] * ratio + 0.000001)
        # if height >= self.IMG_HEIGHT:
        #     height = self.IMG_HEIGHT
        #     ratio = self.IMG_HEIGHT / image.shape[0]
        #     width = int(image.shape[1] * ratio + 0.000001)

        s = time.time()
        detectedObjects = self.ovms_score(stub, image)
        inf_time = time.time() - s

        img, predictions = process_response(
            detectedObjects, image.copy(), self.model.metadatas)
        # print(self.model.pipeline)

        # FIXME last count, last prediction
        self.last_prediction_count = 0
        self.last_prediction = np.array(predictions).tolist()
        logger.warning("save last predictions")
        logger.warning(self.last_prediction)
        self.last_drawn_img = img
        self.last_update = time.time()

    def ovms_score(self, stub, image):
        # model_name = "Default Cascade"
        model_name = self.cascade_name
        input_layer = "image"
        output_layers = [
            "detector/yolo-v3/Conv_14/BiasAdd/YoloRegion",
            "detector/yolo-v3/Conv_22/BiasAdd/YoloRegion",
            "detector/yolo-v3/Conv_6/BiasAdd/YoloRegion"
        ]
        # class_names = load_classes("model_data/coco.names")
        results = {}

        print("Start processing:")
        print(f"\tModel name: {model_name}")

        image = np.array(image, dtype=np.float32)
        image = cv2.resize(image, (416, 416))
        image = image.reshape((1, 416, 416, 3))

        request = predict_pb2.PredictRequest()
        request.model_spec.name = model_name
        request.inputs[input_layer].CopyFrom(
            make_tensor_proto(image, shape=(image.shape)))

        # result includes a dictionary with all model outputs
        try:
            result = stub.Predict(request, 10.0)
        except:
            result = None

        # yolo_outputs = [[], [], []]
        # for output_layer in output_layers:
        #     output = make_ndarray(result.outputs[output_layer])
        #     output_numpy = np.array(output)
        #     anchor_size = output_numpy.shape[2]
        #     output_numpy = output_numpy.transpose(0, 2, 3, 1).reshape(
        #         1, anchor_size, anchor_size, 3, 85)
        #     yolo_outputs[int((anchor_size / 13) / 2)] = output_numpy

        # scores, boxes, classes = yolo_eval(yolo_outputs,
        #                                    classes=80,
        #                                    score_threshold=0.5,
        #                                    iou_threshold=0.3)

        # results = postprocess(boxes, scores, classes, class_names)

        return result

    def process_retrain_image(self, predictions, img):
        for prediction in predictions:
            if self.last_upload_time + UPLOAD_INTERVAL < time.time():
                confidence = prediction["probability"]
                logger.warning("comparing... {} {} {}".format(self.confidence_min, confidence,
                               self.confidence_max))
                if self.confidence_min <= confidence <= self.confidence_max:
                    logger.warning("preparing...")
                    # prepare the data to send
                    tag = prediction["tagName"]
                    height, width = img.shape[0], img.shape[1]
                    (x1, y1), (x2, y2) = parse_bbox(prediction, width, height)
                    labels = json.dumps([{
                        "x1": x1,
                        "x2": x2,
                        "y1": y1,
                        "y2": y2
                    }])
                    jpg = cv2.imencode(".jpg", img)[1].tobytes()

                    send_retrain_image_to_webmodule(jpg, tag, labels,
                                                    confidence, self.cam_id)

                    self.last_upload_time = time.time()
                    break

    def process_send_message_to_iothub(self, predictions):
        if self.iothub_last_send_time + self.iothub_interval < time.time():
            if "ovmsserver" in self.model.endpoint.lower():
                if len(predictions) > 0:
                    message_body = {
                        'camera_name': self.name,
                        'inferences': predictions
                    }
                    send_message_to_iothub(message_body)
                    self.iothub_last_send_time = time.time()
            else:
                predictions = list(p for p in predictions
                                if p["probability"] >= self.threshold)
                if len(predictions) > 0:
                    message_body = {
                        'camera_name': self.name,
                        'inferences': predictions
                    }
                    if self.get_mode() in ['ES', 'DD', 'PC', 'TCC', 'CQA']:
                        message_body['count'] = self.counter
                    send_message_to_iothub(message_body)
                    self.iothub_last_send_time = time.time()

    def precess_send_signal_to_lva(self):
        if self.lva_last_send_time + self.lva_interval < time.time():
            to_send = False
            for p in self.last_prediction:
                if (p["tagName"] in self.send_video_to_cloud_parts
                        and p["probability"] >=
                        self.send_video_to_cloud_threshold):
                    to_send = True
            logger.warning('********** precess send signal to lva **********')
            logger.warning('********** precess send signal to lva **********')
            logger.warning('parts to send: {}'.format(
                self.send_video_to_cloud_parts))
            logger.warning('sending threshold: {}'.format(
                self.send_video_to_cloud_threshold))
            logger.warning('to_send: {}'.format(to_send))
            logger.warning('********** precess send signal to lva **********')
            logger.warning('********** precess send signal to lva **********')
            if to_send:
                send_message_to_lva(self.cam_id)
                self.lva_last_send_time = time.time()
                self.lva_interval = 60

    def draw_img(self):

        img = self.last_img.copy()

        height, width = img.shape[0], img.shape[1]
        predictions = self.last_prediction

        if self.has_aoi:
            draw_aoi(img, self.aoi_info)

        # if it's DD, use the draw_objects function from it
        is_draw = True
        if self.get_mode() == "DD":
            is_draw = False
        if (self.get_mode() == 'PD' and self.use_tracker is True):
            is_draw = False
        if is_draw:
            for prediction in predictions:
                if prediction["probability"] > self.threshold:
                    (x1, y1), (x2, y2) = parse_bbox(prediction, width, height)
                    cv2.rectangle(img, (x1, max(y1, 15)), (x2, y2),
                                  (255, 255, 255), 1)
                    draw_confidence_level(img, prediction)

        self.last_drawn_img = img
        self.last_update = time.time()

    def to_api_model(self):
        return StreamModel(
            cam_id=self.cam_id,
            cam_type=self.cam_type,
            cam_source=self.cam_source,
            send_video_to_cloud=self.send_video_to_cloud,
        )

    def update_display_keep_alive(self):
        self.last_display_keep_alive = time.time()

    def display_is_alive(self):
        return self.last_display_keep_alive + DISPLAY_KEEP_ALIVE_THRESHOLD > time.time(
        )

    def gen(self):
        while self.cam_is_alive and self.display_is_alive():
            if self.last_drawn_img is not None and self.last_update > self.last_send:
                self.last_send = self.last_update
                jpg = cv2.imencode(".jpg", self.last_drawn_img)[1].tobytes()
                logger.warning('===== sneding jpg to browser, size: {}'.format(
                    len(jpg)))
                yield (b"--frame\r\n"
                       b"Content-Type: image/jpeg\r\n\r\n" + jpg + b"\r\n")
                time.sleep(1 / self.frameRate)
            else:
                time.sleep(0.04)


def predict_module_url():
    if is_edge():
        ip = socket.gethostbyname("predictmodule")
        return ip + ":7777"
        # return "PredictModule:7777"
    else:
        return "localhost:7777"


def web_module_url():
    if is_edge():
        ip = socket.gethostbyname("webmodule")
        return ip + ":8000"
        # return "WebModule:8000"
    else:
        return "localhost:8000"


def draw_aoi(img, aoi_info):
    for aoi_area in aoi_info:
        aoi_type = aoi_area["type"]
        label = aoi_area["label"]

        if aoi_type == "BBox":
            cv2.rectangle(
                img,
                (int(label["x1"]), int(label["y1"])),
                (int(label["x2"]), int(label["y2"])),
                (255, 255, 255),
                2,
            )

        elif aoi_area["type"] == "Polygon":
            l = len(label)
            for index, point in enumerate(label):
                p1 = (point["x"], point["y"])
                p2 = (label[(index + 1) % l]["x"], label[(index + 1) % l]["y"])
                cv2.line(img, p1, p2, (255, 255, 255), 2)


def is_inside_aoi(x1, y1, x2, y2, aoi_info):

    obj_shape = Polygon([[x1, y1], [x2, y1], [x2, y2], [x1, y2]])

    for aoi_area in aoi_info:
        aoi_type = aoi_area["type"]
        label = aoi_area["label"]

        if aoi_area["type"] == "BBox":
            if ((label["x1"] <= x1 <= label["x2"]) or
                (label["x1"] <= x2 <= label["x2"])) and (
                    (label["y1"] <= y1 <= label["y2"]) or
                    (label["y1"] <= y2 <= label["y2"])):
                return True

        elif aoi_area["type"] == "Polygon":
            points = []
            for point in label:
                points.append([point["x"], point["y"]])
            aoi_shape = Polygon(points)
            if aoi_shape.is_valid and aoi_shape.intersects(obj_shape):
                return True

    return False


def parse_bbox(prediction, width, height):
    x1 = int(prediction["boundingBox"]["left"] * width)
    y1 = int(prediction["boundingBox"]["top"] * height)
    x2 = x1 + int(prediction["boundingBox"]["width"] * width)
    y2 = y1 + int(prediction["boundingBox"]["height"] * height)
    x1 = min(max(x1, 0), width - 1)
    x2 = min(max(x2, 0), width - 1)
    y1 = min(max(y1, 0), height - 1)
    y2 = min(max(y2, 0), height - 1)
    return (x1, y1), (x2, y2)


def draw_confidence_level(img, prediction):
    height, width = img.shape[0], img.shape[1]

    font = cv2.FONT_HERSHEY_DUPLEX
    font_scale = 0.7
    thickness = 1

    prob_str = str(int(prediction["probability"] * 1000) / 10)
    prob_str = " (" + prob_str + "%)"

    (x1, y1), (x2, y2) = parse_bbox(prediction, width, height)

    text = prediction["tagName"] + prob_str
    img = draw_label(img, text, (x1, max(y1, 15)))

    return img


def send_message_to_iothub(predictions):
    global iot
    if iot:
        try:
            if IS_K8S == "true":
                # re-open connection to avodi connection failure
                iot = IoTHubModuleClient.create_from_connection_string(
                    IOTEDGE_DEVICE_CONNECTION_STRING)
                iot.send_message(json.dumps(predictions))
            else:
                iot.send_message_to_output(json.dumps(predictions), "metrics")
        except:
            logger.warning("[ERROR] Failed to send message to iothub")
        logger.warning("[INFO] sending metrics to iothub")
    else:
        # logger.warning('[METRICS]', json.dumps(predictions_to_send))
        pass


def send_message_to_lva(cam_id):
    if iot:
        try:
            target = "/graphInstances/" + str(cam_id)
            msg = Message("")
            msg.custom_properties["eventTarget"] = target
            iot.send_message_to_output(msg, "InferenceToLVA")
        except:
            logger.warning("[ERROR] Failed to send signal to LVA")
        logger.warning("[INFO] sending signal to LVA")
    else:
        # logger.warning('[INFO] Cannot detect IoT module')
        pass


def send_retrain_image_to_webmodule(jpg, tag, labels, confidence, cam_id):
    logger.warning("[INFO] Sending Image to relabeling {}".format(tag))
    try:
        # requests.post('http://'+web_module_url()+'/api/relabel', data={
        res = requests.post(
            "http://" + web_module_url() +
            "/api/part_detections/1/upload_relabel_image/",
            data={
                "confidence": confidence,
                "labels": labels,
                "part_name": tag,
                "is_relabel": True,
                "img": base64.b64encode(jpg),
                "camera_id": cam_id,
            },
        )
    except:
        logger.warning("[ERROR] Failed to update image for relabeling")


def lva_to_customvision_format(predictions):
    results = []
    for prediction in predictions:
        tagName = prediction['entity']['tag']['value']
        probability = float(prediction['entity']['tag']['confidence'])
        boundingBox = {
            "left": float(prediction['entity']['box']['l']),
            "top": float(prediction['entity']['box']['t']),
            "width": float(prediction['entity']['box']['w']),
            "height": float(prediction['entity']['box']['h']),
        }
        results.append({
            "tagName": tagName,
            "probability": probability,
            "boundingBox": boundingBox,
        })
    return (results)


def update_people_ages(output_nd, people):
    for i in range(output_nd.shape[0]):
        age = int(output_nd[i, 0, 0, 0, 0] * 100)
        if len(people) < i + 1:
            people.append({'age': age})
        else:
            people[i].update({'age': age})
    return people


def update_people_genders(output_nd, people):
    for i in range(output_nd.shape[0]):
        gender = 'male' if output_nd[i, 0, 0, 0,
                                     0] < output_nd[i, 0, 1, 0,
                                                    0] else 'female'
        if len(people) < i + 1:
            people.append({'gender': gender})
        else:
            people[i].update({'gender': gender})
    return people


def update_people_emotions(output_nd, people):
    emotion_names = {
        0: 'neutral',
        1: 'happy',
        2: 'sad',
        3: 'surprised',
        4: 'angry'
    }
    for i in range(output_nd.shape[0]):
        emotion_id = np.argmax(output_nd[i, 0, :, 0, 0])
        emotion = emotion_names[emotion_id]
        if len(people) < i + 1:
            people.append({'emotion': emotion})
        else:
            people[i].update({'emotion': emotion})
    return people


def update_people_coordinate(output_nd, people):
    for i in range(output_nd.shape[0]):
        if len(people) < i + 1:
            people.append({'coordinate': output_nd[i, 0, :]})
        else:
            people[i].update({'coordinate': output_nd[i, 0, :]})
    return people


def process_response(response, img, metadatas):
    predictions = []
    # if response is not None:
    #    coordinates = make_ndarray(response.outputs['coordinates'])
    #    confidences = make_ndarray(response.outputs['confidences'])
    #    is_ages = False
    #    is_emotions = False
    #    is_genders = False
    #    if 'ages' in response.outputs:
    #        ages = make_ndarray(response.outputs['ages'])
    #        is_ages = True
    #    if 'genders' in response.outputs:
    #        genders = make_ndarray(response.outputs['genders'])
    #        is_genders = True
    #    if 'emotions' in response.outputs:
    #        emotions = make_ndarray(response.outputs['emotions'])
    #        is_emotions = True
    #    n = coordinates.shape[0]
    #    predictions = []
    #    for i in range(n):
    #        x1, y1, x2, y2 = coordinates[i,0]
    #        prediction = {
    #            'tag': 'person',
    #            'attributes': [],
    #            'box': {
    #                'l': x1,
    #                't': y1,
    #                'w': x2-x1,
    #                'h': y2-y1
    #            }
    #        }
    #        emotion_label =  ('neutral', 'happy', 'sad', 'surprise', 'anger')
    #        gender_label = ('female', 'male')
    #        if is_emotions:
    #            emotion = emotion_label[np.argmax(emotions[i], axis=1).flatten()[0]]
    #            confidence = np.max(emotions[i], axis=1).flatten()[0]
    #            prediction['attributes'].append({'name': 'emotion', 'value': emotion, 'confidence': confidence})
    #        if is_ages:
    #            age = str(int(ages[i].flatten()[0]*100))
    #            prediction['attributes'].append({'name': 'age', 'value': age, 'confidence': -1})
    #        if is_genders:
    #            gender = gender_label[np.argmax(genders[i], axis=1).flatten()[0]]
    #            confidence = np.max(genders[i], axis=1).flatten()[0]
    #            prediction['attributes'].append({'name': 'gender', 'value': gender, 'confidence': confidence})
    #        predictions.append(prediction)
    if response is not None:
        coordinates = make_ndarray(response.outputs['coordinates'])
        confidences = make_ndarray(response.outputs['confidences'])
        label_ids = make_ndarray(response.outputs['label_ids']).flatten()
        attributes = []
            
        labels = None

        for k in response.outputs:
            if (metadatas is not None) and (k in metadatas):
                #print(k)
                #print(metadatas[k])
                metadata = metadatas[k]
                if metadata['type'] == 'bounding_box':
                    if 'labels' in metadata:
                        labels = metadata['labels']
                if metadata['type'] == 'classification':
                    ndarray = make_ndarray(response.outputs[k])
                    tag_indexes = np.argmax(ndarray, axis=2).flatten()
                    tags = list(metadata['labels'][tag_index]
                                for tag_index in tag_indexes)
                    confidences = np.max(ndarray, axis=2).flatten()
                    attributes.append({
                        'name': k,
                        'type': 'classification',
                        'values': tags,
                        'confidences': confidences
                    })
                if metadata['type'] == 'regression':
                    ndarray = make_ndarray(response.outputs[k])
                    scores = ndarray
                    if 'scale' in metadata:
                        scores *= metadata['scale']
                    scores = scores.flatten().astype('int').tolist()
                    attributes.append({
                        'name': k,
                        'type': 'regression',
                        'values': scores
                    })

        n = coordinates.shape[0]
        predictions = []
        for i in range(n):
            x1, y1, x2, y2 = coordinates[i, 0]
            tag = ''
            # FIXME should add model type or index beginwith here
            #if labels is not None:
            #    if len(labels) == 1:
            #        # Openvino single label prediction  models
            #        tag = labels[0]
            label_id = label_ids[i]
            if label_id < len(labels):
                tag = labels[label_id]
            
                    
            prediction = {
                'tag': tag,
                'attributes': [],
                'box': {
                    'l': np.float(x1),
                    't': np.float(y1),
                    'w': np.float(x2-x1),
                    'h': np.float(y2-y1)
                }
            }
            logger.warning(attributes)
            for attribute in attributes:
                if attribute['type'] == 'regression':
                    prediction['attributes'].append({
                        'name': attribute['name'],
                        'value': attribute['values'][i],
                        'confidence': -1})
                if attribute['type'] == 'classification':
                    prediction['attributes'].append({
                        'name': attribute['name'],
                        'value': attribute['values'][i],
                        'confidence': np.array(attribute['confidences'][i]).tolist()})
            prediction['attributes'].sort(key=lambda x:x['name'])
            predictions.append(prediction)

    h, w, _ = img.shape
    for prediction in predictions:
        x1 = int(prediction['box']['l'] * w)
        y1 = int(prediction['box']['t'] * h)
        x2 = int((prediction['box']['w'] + prediction['box']['l']) * w)
        y2 = int((prediction['box']['h'] + prediction['box']['t']) * h)
        cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 255), 3)
        font = cv2.FONT_HERSHEY_SIMPLEX
        fontScale = 0.5
        color = (0, 255, 255)
        thickness = 1
        text = prediction['tag']
        for attribute in prediction['attributes']:
            if text != '': text += ' / '
            text += str(attribute['value'])
        cv2.putText(img, text, (x1, y1-10), font,
                    fontScale, color, thickness, cv2.LINE_AA)
    return img, predictions
