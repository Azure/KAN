# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import grpc
import time
import custom_node_pb2
import custom_node_pb2_grpc

import cv2


class CustomNodeClient:

    # def __init__(self, host, port, instance_id, skill_id, device_id):
    def __init__(self, endpoint_url, instance_id, skill_id, device_id):
        #self.channel = grpc.insecure_channel(f'{host}:{port}')
        self.channel = grpc.insecure_channel(endpoint_url)
        self.stub = custom_node_pb2_grpc.CustomNodeHandlerStub(self.channel)
        self.seq = 1
        self.image_type = None

        response = self.stub.Handshake(
            custom_node_pb2.HandshakeRequest(
                seq=self.seq, instance_id=instance_id, skill_id=skill_id, device_id=device_id)
        )

        if response.ack == self.seq:
            self.seq += 1
            if response.image_type == custom_node_pb2.ImageType.IMAGE_TYPE_NUMPY:
                self.image_type = 'numpy'
            elif response.image_type == custom_node_pb2.ImageType.IMAGE_TYPE_BMP:
                self.image_type = '.bmp'
            elif response.image_type == custom_node_pb2.ImageType.IMAGE_TYPE_JPEG:
                self.image_type = '.jpeg'
            else:
                raise Exception(f'Unknown Image Type {self.image_type}')
        else:
            raise Exception(
                f"Incorrect Ack, expect {self.seq} but got {response.ack}")

    def send(self, frame):

        ##
        image = frame.image.image_pointer

        if self.image_type == 'numpy':
            image_pointer = image.tobytes()
        else:
            image_pointer = cv2.imencode(self.image_type, image)[1]

        height, width, _ = image.shape

        response = self.stub.Process(
            custom_node_pb2.ProcessRequest(
                seq=self.seq,
                frame=custom_node_pb2.Frame(
                    image=custom_node_pb2.Image(image_pointer=image_pointer, properties=custom_node_pb2.ImageProperties(
                        width=width, height=height, color_format=custom_node_pb2.COLOR_FORMAT_BGR)),
                    insights_meta=None,
                    timestamp=custom_node_pb2.Timestamp(seconds=0, nanos=0),
                    frame_id='0',
                    roi=None,
                    datetime='2000-01-01T00:00:00',
                )
            )
        )
        if response.ack != self.seq:
            raise Exception(
                f"Incorrect Ack, expect {self.seq} but got {response.ack}")

        self.seq += 1

        return response

    def close(self):
        self.channel.close()


if __name__ == '__main__':

    import numpy as np
    img = np.arange(12).reshape((2, 2, 3)).astype('uint8')
    client = CustomNodeClient('localhost', 6677, '1', '2', '3')

    response = client.send(img)
    print(response)

    response = client.send(img)
    print(response)

    response = client.send(img)
    print(response)

    # if client.image_type == 'numpy':
    #    print('image:')
    #    image_pointer = response.frame.image.image_pointer
    #    width = response.frame.image.properties.width
    #    height = response.frame.image.properties.height
    #    print(np.frombuffer(response.frame.image.image_pointer, dtype='uint8').reshape((height, width, 3)))
    # else:
    #    print('image:')
    #    image_pointer = response.frame.image.image_pointer
    #    width = response.frame.image.properties.width
    #    height = response.frame.image.properties.height
    #    print(cv2.imdecode(image_pointer, cv2.IMREAD_COLOR))

    #response = client.send(img, 1, 'frame_id', 'datetime')
    # print(response)
    #response = client.send(img, 1, 'frame_id', 'datetime')
    # print(response)
