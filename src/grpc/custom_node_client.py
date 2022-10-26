import grpc
import time
import custom_node_pb2
import custom_node_pb2_grpc

import cv2

class CustomNodeClient:

    def __init__(self, host, port, instance_id, skill_id, device_id):
        self.channel = grpc.insecure_channel(f'{host}:{port}')
        self.stub = custom_node_pb2_grpc.CustomNodeHandlerStub(self.channel)
        self.seq = 1
        self.image_type = None

        response = self.stub.StartSession(
            custom_node_pb2.StartSessionRequest(seq=self.seq, instance_id=instance_id, skill_id=skill_id, device_id=device_id)
        )

        if response.ack == self.seq:
            self.seq += 1
            if response.image_type == custom_node_pb2.IMAGE_TYPE_NUMPY:
                self.image_type = 'numpy'
            else:
                self.image_type = 'raw'
        else:
            raise Exception(f"Incorrect Ack, expect {self.seq} but got {response.ack}") 

    def send(self, image, timestamp, frame_id, datetime):


        if self.image_type == 'numpy':
            image_pointer = image.tobytes()
        else:
            image_pointer = cv2.imencode('.bmp', image)[1]

        height, width, _ = image.shape

        response = self.stub.ProcessFrame(
            custom_node_pb2.ProcessFrameRequest(
                seq =self.seq,
                frame=custom_node_pb2.Frame(
                    image=custom_node_pb2.Image(image_pointer=image_pointer, properties=custom_node_pb2.ImageProperties(width=width, height=height, color_format=custom_node_pb2.COLOR_FORMAT_BGR)),
                    timestamp=timestamp,
                    frame_id=frame_id,
                    datetime=datetime,
                )
            )
        )
        if response.ack != self.seq:
            raise Exception(f"Incorrect Ack, expect {self.seq} but got {response.ack}")

        self.seq += 1

        return response



    def close(self):
        self.channel.close()


if __name__ == '__main__':

    import numpy as np
    img = np.arange(12).reshape((2, 2, 3)).astype('uint8')
    client = CustomNodeClient('localhost', 6677, '1', '2', '3')
    response = client.send(img, 1, 'frame_id', 'datetime')
    print(response)
    if client.image_type == 'numpy':
        print('image:')
        image_pointer = response.frame.image.image_pointer
        width = response.frame.image.properties.width
        height = response.frame.image.properties.height
        print(np.frombuffer(response.frame.image.image_pointer, dtype='uint8').reshape((height, width, 3)))
    else:
        print('image:')
        image_pointer = response.frame.image.image_pointer
        width = response.frame.image.properties.width
        height = response.frame.image.properties.height
        print(cv2.imdecode(image_pointer, cv2.IMREAD_COLOR))

    #response = client.send(img, 1, 'frame_id', 'datetime')
    #print(response)
    #response = client.send(img, 1, 'frame_id', 'datetime')
    #print(response)