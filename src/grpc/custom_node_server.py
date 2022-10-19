import grpc
from concurrent import futures
import custom_node_pb2
import custom_node_pb2_grpc

class CustomNode:

    def __init__(self):
        pass

    def ProcessFrame(self, request: custom_node_pb2.ProcessFrameRequest, context) -> custom_node_pb2.ProcessFrameResponse:
        raise NotImplementedError




class CustomNodeServer:
    def __init__(self, port, node):
        self.port = port
        self.server = grpc.server(futures.ThreadPoolExecutor())
        custom_node_pb2_grpc.add_CustomNodeHandlerServicer_to_server(node, self.server)
        self.server.add_insecure_port(f'[::]:{port}')

    def serve(self):
        self.server.start()
        print(f'Server started, listening on {self.port}', flush=True)
        self.server.wait_for_termination()


    def close(self):
        self.channel.close()


if __name__ == '__main__':

    class PingPong(CustomNode):
        def ProcessFrame(self, request: custom_node_pb2.ProcessFrameRequest, context) -> custom_node_pb2.ProcessFrameResponse:
            print('processing ...')
            frame = custom_node_pb2.Frame(
                timestamp=request.frame.timestamp,
                frame_id=request.frame.frame_id,
                instance_id=request.frame.instance_id,
                skill_id=request.frame.skill_id,
                device_id=request.frame.device_id,
                datetime=request.frame.datetime,
            )
            return custom_node_pb2.ProcessFrameResponse(frame=frame)

    
    server = CustomNodeServer(6677, PingPong())
    server.serve()