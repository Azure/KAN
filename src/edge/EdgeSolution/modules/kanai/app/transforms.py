# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

from node import Transform
from frame import ObjectMeta, Bbox, InsightsMeta
from common.voe_ipc import is_iotedge

class FilterTransform(Transform):
    def __init__(self, labels=None, confidence_threshold=None, instance_name=None):
        super().__init__()

        if confidence_threshold is not None: 
            confidence_threshold = float(confidence_threshold)

        if labels is None:
            self.labels = []
        else:
            try:
                self.labels = eval(labels)
            except:
                print(f'Unknown labels {labels}', labels)
                self.labels = []

        self.confidence_threshold = confidence_threshold


    def process(self, frame):

        new_objects_meta = []

        #print(self.labels, self.confidence_threshold)

        print(frame.insights_meta.objects_meta)

        for object_meta in frame.insights_meta.objects_meta:
            if self.labels:
                if object_meta.label not in self.labels:
                    continue
            if self.confidence_threshold:
                if object_meta.confidence < self.confidence_threshold / 100:
                    continue

            new_objects_meta.append(object_meta)

        frame.insights_meta.objects_meta = new_objects_meta


from grpc_proto.custom_node_client import CustomNodeClient

class GrpcTransform(Transform):

    def __init__(self, endpoint_url, instance_name, 
            container_image=None, container_name=None, create_options=None, port=None, restart_policy=None, route=None, type=None):
        super().__init__()
        self.endpoint_url = endpoint_url

        if type == 'container' and is_iotedge():
            self.endpoint_url = instance_name + '-' + self.endpoint_url

        print('--------------------------')
        print('is_iotedge', is_iotedge(), flush=True)
        print('endpoint_uri', self.endpoint_url, flush=True)
        print('--------------------------')

        self.client = CustomNodeClient(self.endpoint_url, '', '', '')

    def process(self, frame):
        response = self.client.send(frame)

        new_objects_meta = []

        for object_meta in response.insights_meta.objects_meta:
            #print(object_meta)
            frame_object_meta = ObjectMeta(
               timestamp=object_meta.timestamp.seconds+object_meta.timestamp.nanos,
               label=object_meta.label,
               confidence=object_meta.confidence,
               inference_id=object_meta.inference_id,
               attributes=[],
               bbox=Bbox(l=object_meta.bbox.l, 
                          t=object_meta.bbox.t,
                          w=object_meta.bbox.w,
                          h=object_meta.bbox.h,
               )
            )
            frame.insights_meta.objects_meta.append(frame_object_meta)
        
        return frame

