## Intro

in `custom_node.proto3`

we have a simple request/response rpc for communication between voeedge(client) and your own node(server)

```
service CustomNodeHandler {
	rpc Handshake(HandshakeRequest) returns (HandshakeResponse) {}
    rpc Process (ProcessRequest) returns (ProcessResponse) {}
}
```

For each frame, voedge will invoke `Process` and send the a `ProcessRequest` to the custom node.
The Custom node need to implement `Process` and respond `ProcessResponse` back to the voeedge


## Build your own custom node

### Inheritance CustomNode

```python

from custom_node_server import CustomNode

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

		return custom_node_pb2.ProcessResponse(ack=request.seq, insights_meta=insights_meta)
```



### Build Custom Node grpc server

```python

from custom_node_server import CustomNodeServer

server = CustomNodeServer(6677, FakeDetection())
server.serve()
```


### Others

to generate py codes
```python
python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. custom_node.proto
```
