import grpc
import time
import custom_node_pb2
import custom_node_pb2_grpc

class CustomNodeClient:

    def __init__(self, host, port):
        self.channel = grpc.insecure_channel(f'{host}:{port}')
        self.stub = custom_node_pb2_grpc.CustomNodeHandlerStub(self.channel)
        self.seq = 1

        response = self.stub.ProcessFrame(
            custom_node_pb2.StartSessionRequest(seq=self.seq)
        )

        if response.ack == self.seq:
            self.seq += 1
        else:
            raise Exception(f"Incorrect Ack, expect {self.seq} but got {response.ack}") 

    def send(self, timestamp, frame_id, instance_id, skill_id, device_id, datetime):
        response = self.stub.ProcessFrame(
            custom_node_pb2.ProcessFrameRequest(
                seq =self.seq,
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
        if response.ack != self.seq:
            raise Exception(f"Incorrect Ack, expect {self.seq} but got {response.ack}")

        self.seq += 1

        return response



    def close(self):
        self.channel.close()


if __name__ == '__main__':

    client = CustomNodeClient('localhost', 6677)
    response = client.send(1, '1', '1', '1', '1', '1')
    print(response)
    response = client.send(1, '1', '1', '1', '1', '1')
    print(response)
    response = client.send(1, '1', '1', '1', '1', '1')
    print(response)