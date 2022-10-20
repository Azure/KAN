# Generated by the gRPC Python protocol compiler plugin. DO NOT EDIT!
"""Client and server classes corresponding to protobuf-defined services."""
import grpc

import custom_node_pb2 as custom__node__pb2


class CustomNodeHandlerStub(object):
    """Missing associated documentation comment in .proto file."""

    def __init__(self, channel):
        """Constructor.

        Args:
            channel: A grpc.Channel.
        """
        self.StartSession = channel.unary_unary(
                '/custom_node.CustomNodeHandler/StartSession',
                request_serializer=custom__node__pb2.StartSessionRequest.SerializeToString,
                response_deserializer=custom__node__pb2.StartSessionResponse.FromString,
                )
        self.ProcessFrame = channel.unary_unary(
                '/custom_node.CustomNodeHandler/ProcessFrame',
                request_serializer=custom__node__pb2.ProcessFrameRequest.SerializeToString,
                response_deserializer=custom__node__pb2.ProcessFrameResponse.FromString,
                )


class CustomNodeHandlerServicer(object):
    """Missing associated documentation comment in .proto file."""

    def StartSession(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')

    def ProcessFrame(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')


def add_CustomNodeHandlerServicer_to_server(servicer, server):
    rpc_method_handlers = {
            'StartSession': grpc.unary_unary_rpc_method_handler(
                    servicer.StartSession,
                    request_deserializer=custom__node__pb2.StartSessionRequest.FromString,
                    response_serializer=custom__node__pb2.StartSessionResponse.SerializeToString,
            ),
            'ProcessFrame': grpc.unary_unary_rpc_method_handler(
                    servicer.ProcessFrame,
                    request_deserializer=custom__node__pb2.ProcessFrameRequest.FromString,
                    response_serializer=custom__node__pb2.ProcessFrameResponse.SerializeToString,
            ),
    }
    generic_handler = grpc.method_handlers_generic_handler(
            'custom_node.CustomNodeHandler', rpc_method_handlers)
    server.add_generic_rpc_handlers((generic_handler,))


 # This class is part of an EXPERIMENTAL API.
class CustomNodeHandler(object):
    """Missing associated documentation comment in .proto file."""

    @staticmethod
    def StartSession(request,
            target,
            options=(),
            channel_credentials=None,
            call_credentials=None,
            insecure=False,
            compression=None,
            wait_for_ready=None,
            timeout=None,
            metadata=None):
        return grpc.experimental.unary_unary(request, target, '/custom_node.CustomNodeHandler/StartSession',
            custom__node__pb2.StartSessionRequest.SerializeToString,
            custom__node__pb2.StartSessionResponse.FromString,
            options, channel_credentials,
            insecure, call_credentials, compression, wait_for_ready, timeout, metadata)

    @staticmethod
    def ProcessFrame(request,
            target,
            options=(),
            channel_credentials=None,
            call_credentials=None,
            insecure=False,
            compression=None,
            wait_for_ready=None,
            timeout=None,
            metadata=None):
        return grpc.experimental.unary_unary(request, target, '/custom_node.CustomNodeHandler/ProcessFrame',
            custom__node__pb2.ProcessFrameRequest.SerializeToString,
            custom__node__pb2.ProcessFrameResponse.FromString,
            options, channel_credentials,
            insecure, call_credentials, compression, wait_for_ready, timeout, metadata)
