# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

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
        self.Handshake = channel.unary_unary(
            '/custom_node.CustomNodeHandler/Handshake',
            request_serializer=custom__node__pb2.HandshakeRequest.SerializeToString,
            response_deserializer=custom__node__pb2.HandshakeResponse.FromString,
        )
        self.Process = channel.unary_unary(
            '/custom_node.CustomNodeHandler/Process',
            request_serializer=custom__node__pb2.ProcessRequest.SerializeToString,
            response_deserializer=custom__node__pb2.ProcessResponse.FromString,
        )


class CustomNodeHandlerServicer(object):
    """Missing associated documentation comment in .proto file."""

    def Handshake(self, request, context):
        """Client should begin with this Handshake with server
        """
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')

    def Process(self, request, context):
        """After Handshake, client can start to data to server for processing
        rpc Process (stream ProcessRequest) returns (stream ProcessResponse) {}
        """
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')


def add_CustomNodeHandlerServicer_to_server(servicer, server):
    rpc_method_handlers = {
        'Handshake': grpc.unary_unary_rpc_method_handler(
            servicer.Handshake,
            request_deserializer=custom__node__pb2.HandshakeRequest.FromString,
            response_serializer=custom__node__pb2.HandshakeResponse.SerializeToString,
        ),
        'Process': grpc.unary_unary_rpc_method_handler(
            servicer.Process,
            request_deserializer=custom__node__pb2.ProcessRequest.FromString,
            response_serializer=custom__node__pb2.ProcessResponse.SerializeToString,
        ),
    }
    generic_handler = grpc.method_handlers_generic_handler(
        'custom_node.CustomNodeHandler', rpc_method_handlers)
    server.add_generic_rpc_handlers((generic_handler,))

 # This class is part of an EXPERIMENTAL API.


class CustomNodeHandler(object):
    """Missing associated documentation comment in .proto file."""

    @staticmethod
    def Handshake(request,
                  target,
                  options=(),
                  channel_credentials=None,
                  call_credentials=None,
                  insecure=False,
                  compression=None,
                  wait_for_ready=None,
                  timeout=None,
                  metadata=None):
        return grpc.experimental.unary_unary(request, target, '/custom_node.CustomNodeHandler/Handshake',
                                             custom__node__pb2.HandshakeRequest.SerializeToString,
                                             custom__node__pb2.HandshakeResponse.FromString,
                                             options, channel_credentials,
                                             insecure, call_credentials, compression, wait_for_ready, timeout, metadata)

    @staticmethod
    def Process(request,
                target,
                options=(),
                channel_credentials=None,
                call_credentials=None,
                insecure=False,
                compression=None,
                wait_for_ready=None,
                timeout=None,
                metadata=None):
        return grpc.experimental.unary_unary(request, target, '/custom_node.CustomNodeHandler/Process',
                                             custom__node__pb2.ProcessRequest.SerializeToString,
                                             custom__node__pb2.ProcessResponse.FromString,
                                             options, channel_credentials,
                                             insecure, call_credentials, compression, wait_for_ready, timeout, metadata)
