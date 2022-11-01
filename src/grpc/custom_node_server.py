import grpc
from concurrent import futures
import custom_node_pb2
import custom_node_pb2_grpc

class CustomNode:

    def __init__(self):
        pass

    def Handshake(self, request: custom_node_pb2.HandshakeRequest, context) -> custom_node_pb2.HandshakeResponse:
        return NotImplementedError

    def Process(self, request: custom_node_pb2.ProcessRequest, context) -> custom_node_pb2.ProcessResponse:
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

    class FakeDetection(CustomNode):


        def Handshake(self, request: custom_node_pb2.HandshakeRequest, context) -> custom_node_pb2.HandshakeResponse:
            return custom_node_pb2.HandshakeResponse(
                ack=request.seq, 
                image_type=custom_node_pb2.ImageType.IMAGE_TYPE_NUMPY,
                process_request_type=custom_node_pb2.ProcessRequestType.FRAME_WITH_IMAGE,
                process_response_type=custom_node_pb2.ProcessResponseType.INSIGHTS_META_ONLY,
            )


        def Process(self, request: custom_node_pb2.ProcessRequest, context) -> custom_node_pb2.ProcessResponse:
            print('processing ...')
            insights_meta = custom_node_pb2.InsightsMeta(
                objects_meta=[
                    custom_node_pb2.ObjectMeta(    
                        timestamp=request.frame.timestamp,
                        label='car',
                        confidence=0.9,
                        inference_id='inference_1',
                        bbox=custom_node_pb2.BBox(l=0.1, t=0.2, w=0.3, h=0.4)
                    )
                ]
            )
            print('ok')

            return custom_node_pb2.ProcessResponse(ack=request.seq, insights_meta=insights_meta)

    
    server = CustomNodeServer(6677, FakeDetection())
    server.serve()
