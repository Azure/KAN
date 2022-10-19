import grpc
import custom_node_pb2
import custom_node_pb2_grpc

class CustomNodeClient:

    def __init__(self, host, port):
        self.channel = grpc.insecure_channel(f'{host}:{port}')
        self.stub = custom_node_pb2_grpc.CustomNodeHandlerStub(self.channel)

    def send(self, timestamp, frame_id, instance_id, skill_id, device_id, datetime):
        response = self.stub.ProcessFrame(
            custom_node_pb2.ProcessFrameRequest(
                frame=custom_node_pb2.Frame(
                    timestamp=timestamp,
                    frame_id=frame_id,
                    instance_id=instance_id,
                    skill_id=skill_id,
                    device_id=device_id,
                    datetime=datetime,
                )
            )
        )

        return response



    def close(self):
        self.channel.close()


if __name__ == '__main__':

    client = CustomNodeClient('localhost', 6677)
    response = client.send(1, '1', '1', '1', '1', '1')
    print(response)