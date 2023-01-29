# How-to bring your own model (BYOM)

Bringing your own model allows you to use your models in the POSS environment, either by themselves or in concert with other models. This flexibility enables both quick prototyping and building production pipelines. BYOM brings a plug-and-play capability found nowhere else.

## Prerequisites

-   An ML model in [ONNX](https://onnx.ai/) format. ONNX supports many frameworks you may see [here](https://onnx.ai/supported-tools.html#buildModel). If you must convert to the ONNX format, this repository provides the [tutorials](https://github.com/onnx/tutorials).
-   The location of the ONNX model and label files in Azure blob storage.

## Add an External Model

Open the portal URL you received as part of initial [setup](https://github.com/Azure/PerceptOSS/blob/main/docs/tutorial/setup-guide.md).

1.  From the left navigation, select **Models**.

![Graphical user interface, text, application, email Description automatically generated](./media/cee1a5b7a3bfbf8c7444351dfb323b57.png)

1.  Select **Add External Model.**

This opens a page very similar to adding a **custom model**.

![Graphical user interface, text, application, email Description automatically generated](./media/c90dbb3041129c4d098aa5d9eba4c155.png)

1.  Select **Model Name** and assign your model a meaningful name.
2.  Select **Type** and choose either **detection** or **classification**.

![Graphical user interface Description automatically generated with medium confidence](./media/863577c99ad3bf7564e63f529edb0805.png)

1.  Select **Model Format** and choose **ONNX**.

Later releases will cover a variety of formats.

![Graphical user interface Description automatically generated](./media/cf6919bde0b518e6974d402a42080cec.png)

1.  Select the **Blobstorage** path for the model file and fill in the location of the model. Do the same for the label file.
2.  Fill in a meaningful description of the model in the **Description** field.

![A picture containing graphical user interface Description automatically generated](./media/4198a3a888f4c19b4d45a165e0230ced.png)

1.  (**Optional**) Select next and assign tags similarly to the way Azure resources are tagged.

![Graphical user interface, text, application Description automatically generated](./media/d8abc90d51d5e3459908a94cb1527961.png)

1.  Select **Review and Create.**

![Graphical user interface, text, application Description automatically generated](./media/a99bbcd0ec9d105b7cb51f0b6f5fe728.png)

1.  Select **Create** and your model will now appear under **Your Added Models**.

![Graphical user interface, text, application, email Description automatically generated](./media/e13bb4f4802f6d39c5e376f5882b6298.png)

## Next steps

Now that you understand what BYOM is and how to add models through the portal, your next step is:

-   Go to the AI Skills page to connect your models in a cascade which can chain models and business logic together.


 
 


 
 
 
 
 
  


# How-to use gRPC Custom Processing

Users are able to create AI Skills to manage the flow of deployments. The drag-and-drop control is the core method of AI Skill page to compose the flow of an AI Skill. One of the provided nodes is gRPC Custom Processing node, which allows users to host by themselves or let us host on the edge.

![Graphical user interface, text, application, email Description automatically generated](./media/01.png)


## Type 1: Endpoint URL

1.	Click Create AI Skill to start a new AI Skill creation.

![Graphical user interface, text, application, email Description automatically generated](./media/02.png)

1.	Fill in the necessary information in the Basics tab, which include the Skill Name, Desired Frame Rate (fps), and selecting Device Acceleration, and then click Next to go into Drag-and-Drop Nodes page.


![Graphical user interface, text, application, email Description automatically generated](./media/03.png)

1.	There are three categories on the left side, including Import, Process, and Export. Import now only has the Camera Input node, which already exists on the canvas by default.
2.	Drag the gPRC Custom Processing node and drop on the canvas for gRPC settings.

![Graphical user interface, text, application, email Description automatically generated](./media/04.png)

1.	There are two types, including Container and Endpoint URL.
2.	Select Endpoint URL.

![Graphical user interface, text, application, email Description automatically generated](./media/05.png)

Fill the Endpoint URL in the field, and then click Done to save.

![Graphical user interface, text, application, email Description automatically generated](./media/06.png)

1.	Select one of the Export nodes and drag and drop into the canvas. (Video Snippet, Insights to IoT Hub, and Insights to IoT Edge Module will need Azure resources.) 
2.	Click Next to Tags (Optional) Tab.

![Graphical user interface, text, application, email Description automatically generated](./media/07.png)

1.	(Optional) Assign tags similarly to the way Azure resources are tagged.
2.	Click Review + Create to Review + Create Tab.

![Graphical user interface, text, application, email Description automatically generated](./media/08.png)

1.	Click Create to complete, and then Your AI Skill will now appear on Al Skills page.

![Graphical user interface, text, application, email Description automatically generated](./media/09.png)


## Type 2: Container

The AI Skill creation is the same as Type 1: Endpoint URL, except for selecting Container type in the gRPC Custom Processing node.

![Graphical user interface, text, application, email Description automatically generated](./media/10.png)

1.	Fill in the information for your container, which includes the Name of container, the Image URL for the path, the Create options (optional) for more detail of container settings, and selecting a Restart policy.
2.	Fill in the information for the endpoint, which includes the Port and Route (optional) that are exited in your container.
3.	If you need, the Environment Variables allows you to fill in the name and the corresponding value.
4.	Finally, set the Constraints for use. Select X64 with Accelerations (Nvidia dGPU, CPU, and Intel iGPU(EFLOW only) ) or select ARM64 with Accelerations (Nvidia Jetson(Jetpack 5) ).
5.	Click Done to save

![Graphical user interface, text, application, email Description automatically generated](./media/11.png)

The following step will be the same as Type 1: Endpoint URL.


## gRPC Contract Explain

The protobuf file for the gRPC contract is [here](../../src/grpc/custom_node.proto)

```
service CustomNodeHandler {
	rpc Handshake(HandshakeRequest) returns (HandshakeResponse) {}
    rpc Process (ProcessRequest) returns (ProcessResponse) {}
}
```

### Handshaking

Client and server need to follow this protocol to setup the connection before starting sending frame

During the handshaking, client should send a sequence number `seq` and following attributes:
1. instance_id
2. skill_id
3. device_id

And server should respond an `ack` with followings
1. Image Type for the image that client must send to server latr
2. The format for Request and Response we'll use in Process stage

There're 3 kinds of `ImageType`s: numpy, bmp, and jpeg
```proto
enum ImageType {

    // Use Numpy Bytes
    IMAGE_TYPE_NUMPY = 0;

    // Use BMP
    IMAGE_TYPE_BMP   = 1;

    // Use JPEG
    IMAGE_TYPE_JPEG  = 2;
}
```

There're 2 kinds of Request (client -> server): image and without-image
```proto
enum ProcessRequestType {
    // Client sends the whole Frame to Server
    FRAME_WITH_IMAGE          = 0;

    // Client sends the Frame without Image to Server
    FRAME_WITHOUT_IMAGE       = 1;
}
```

A `Frame` contains many information, the root message is
```proto
message Frame {
    Image        image         = 1;
    InsightsMeta insights_meta = 2;
    Timestamp    timestamp     = 3;
    Roi          roi           = 4;
    string       frame_id      = 5;
    string       datetime      = 6;
}
```
Most of the information (e.g. boundingbox, class, ...) is in `InsightsMeta`. The largest size one is `Image`. Sometimes custom_node might not need the Image itself (e.g. a pure bounding box location-based tracker), that's why we have the without-image option here.

```proto
message Image {
    bytes image_pointer        = 1;
    ImageProperties properties = 2;
}
```
image_pointer contains the image itself, might be numpy, bmp, or jpeg according to what server specified during the handshaking stage. If the server asks for `FRAME_WITHOUT_IMAGE`, then client should just leave `image_pointer` empty


`ProcessResponseType` specify the server's behavior during the Process Stage
```proto
enum ProcessResponseType {
    // Server returns Image to Client
    IMAGE_ONLY = 0;

    // Server returns InsightsMeta to Client
    INSIGHTS_META_ONLY = 1;

    // Server returns Image and InsightsMeta to client
    IMAGE_AND_INSIGHTS_META = 2;

    // Server returns Response with only ack
    EMPTY = 3;
}
```

Following is what server sends back to client
```proto
message ProcessResponse {
    int64 ack = 1;
    Image image = 2;
    InsightsMeta insights_meta = 3;
}
```
1. every kind of response contains `ack`
2. `IMAGE_ONLY`: insights_meta is empty, the reponse contains `image`. the example for this is to build a flip node that only flip the image and send it back to the client. And then client(streaming) will send the new image to the next node
3. `INSIGHTS_META_ONLY`: insights_meta only, e.g. an object detection server should response the bounding boxes, confidence scores, and classes without the image
4. `IMAGE_AND_INSIGHTS_META`: send both of them
5. `EMPTY`: send none of them



## Sample custom node

You could find the sample node [here](../../src/grpc/custom_node_server.py)

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


