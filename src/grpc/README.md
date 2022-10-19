## Intro

in `custom_node.proto3`

we have a simple request/response rpc for communication between voeedge(client) and your own node(server)

```
service CustomNodeHandler {
    rpc ProcessFrame (ProcessFrameRequest) returns (ProcessFrameResponse) {}
}
```

For each frame, voedge will invoke `ProcessFrame` and send the a `ProcessFrameRequest` to the custom node.
The Custom node need to implement `ProcessFrame` and respond `ProcessFrameResponse` back to the voeedge


## Build your own custom node

### Inheritance CustomNode

```python

from custom_node_server import CustomNode

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
```


### Build Custom Node grpc server

```python

from custom_node_server import CustomNodeServer

server = CustomNodeServer(6677, PingPong())
server.serve()
```

