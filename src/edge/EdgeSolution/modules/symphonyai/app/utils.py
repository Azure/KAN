# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import numpy as np
import cv2

def insights_overlay(img, frame):

    h, w, _ = img.shape

    print(f'img shape -> h {h} w {w}', flush=True)
  

    for object_meta in frame.insights_meta.objects_meta:
        bbox = object_meta.bbox
        print(f'bbox-->', bbox)
        p1 = int(bbox.l * w), int(bbox.t * h)
        p2 = int((bbox.l+bbox.w) * w), int((bbox.t+bbox.h) * h)
        color = (0, 0, 255)
        thickness = 2

        cv2.rectangle(img, p1, p2, color, thickness)

        label = f'{object_meta.label} ({round(object_meta.confidence, 2)})'
        fontScale = 1
        font = cv2.FONT_HERSHEY_SIMPLEX
        org = p1[0], p1[1]-20
        thickness = 2
        color = (0, 0, 255)

        for attribute in object_meta.attributes:
            label += f', {attribute.name}: {attribute.label}'

        cv2.putText(img, label, org, font,
               fontScale, color, thickness, cv2.LINE_AA)
