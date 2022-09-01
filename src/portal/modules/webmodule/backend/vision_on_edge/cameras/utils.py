# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""App utilities.

Does not depends on app/models.
"""

import logging

import cv2
import requests
import socket
from urllib.parse import urlparse

from ..azure_iot.utils import upload_module_url
from ..notifications.models import Notification
from .exceptions import CameraMediaSourceInvalid, CameraRtspBusy, CameraRtspInvalid

logger = logging.getLogger(__name__)


def is_valid_rtsp(rtsp, raise_exception: bool = False):
    """is_valid_rtsp.

    Args:
        rtsp: int 0 or str (rtsp://)
    """
    if str(rtsp) in ["0", "1"]:
        return True
    if isinstance(rtsp, str) and rtsp.lower().find("rtsp") == 0:
        return True
    if raise_exception:
        raise CameraRtspBusy
    return False


def normalize_rtsp(rtsp: str, raise_exception: bool = False) -> str:
    """normalize_rtsp.

    Return cv2 capturable str/integer
    RTSP://xxx => rtsp://

    Args:
        rtsp: rtsp

    Returns:
        str: normalized_rtsp
    """
    if not is_valid_rtsp(rtsp=rtsp, raise_exception=raise_exception):
        return rtsp
    if rtsp in [0, "0"]:
        return 0
    if rtsp in [1, "1"]:
        return 1
    result = rtsp
    if isinstance(rtsp, str) and rtsp.lower().find("rtsp") == 0:
        result = "rtsp" + rtsp[4:]
    return result

def check_rtsp_availability(rtsp):
    
    u = urlparse(rtsp)
    
    hostname = u.hostname
    port = u.port
    if port is None: port = 554
    

    TIMEOUT = 2
    try: 
        s = socket.create_connection((hostname, port), TIMEOUT)
        s.close()
    except:
        return False
    
    return True

def verify_rtsp(rtsp, raise_exception: bool = False):
    """Validate a rtsp.
    Args:
        rtsp (str)

    Returns:
        is_rtsp_valid (bool)
    """

    logger.info("verify_rtsp %s", rtsp)
    rtsp = normalize_rtsp(rtsp=rtsp)
    if not isinstance(rtsp, int) and not isinstance(rtsp, str):
        return False

    if not check_rtsp_availability(rtsp):
        return False

    if rtsp == "":
        if raise_exception:
            raise CameraRtspInvalid
        return False
    cap = cv2.VideoCapture(rtsp)
    if not cap.isOpened():
        cap.release()
        if raise_exception:
            raise CameraRtspBusy
        return False
    is_ok, _ = cap.read()
    if not is_ok:
        cap.release()
        if raise_exception:
            raise CameraRtspBusy
        return False
    cap.release()
    return True


def upload_media_source(media_source):
    res = requests.post(
        "http://" + str(upload_module_url()) + "/upload", json={"url": media_source}
    )
    if res.status_code != 200:
        raise CameraMediaSourceInvalid

    Notification.objects.create(
        notification_type="upload",
        sender="system",
        title="upload status",
        details="Media source uploaded",
    )
    rtsp = res.json()
    return rtsp
