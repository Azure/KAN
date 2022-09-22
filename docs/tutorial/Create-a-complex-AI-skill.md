# Create a complex AI skill

## Overview

Azure Percept (P) skills are deployable packages to Edge devices. The packages are a cascade of stages or *nodes* where the video feed is consumed by an edge device, inferences are calculated, results are filtered, and results and video clips are exported for further business logic processing or storage. There are three groups of nodes that comprise AI Skills:

1.  Model – these are all the machine learning models available for detection and classification

    Models may be selected from the Model Zoo, customized from an existing Azure Custom Vision (ACV) project, or a developer’s own external model (Bring Your Own Model, BYOM).

1.  Transform – transforms and enriches the data, for instance it can filter classes to the one we want to implement for our scenario. A filter may also only forward inference results that meet confidence level estimates.
2.  

![Graphical user interface, application Description automatically generated](./media/f6831e85021adeb3d109ce68d1fc8c5c.png)

1.  Export - helps you export raw inference data and actionable insights to a broad range of locations in the cloud. Locally at the edge, you will be able to create your own custom module that will allow you to integrate with other applications and systems in your customer's environment. Here are few nodes that we support today:

![Graphical user interface, application Description automatically generated](./media/7005cc8e5afd1de93a13e86b150173c3.png)

An AI skill allows the result of one model to feed into the next. For example, the first model may detect vehicles and pass those to a model that classifies them by type; car, truck, or bus. Based on user defined logic, these insights video snippets or sent to an IoT Hub.

AI skills are built in four steps:

1.  Supplying basic information on the skill
2.  Adding and configuring nodes
3.  Adding tags (**Optional**)
4.  Review and Creation

In this document we will build an AI skill that detects vehicles and then classifies what sort of vehicle it is.

Building an AI Skill

1.  From the left navigation blades, select **AI Skills**, and then select **Create AI Skill**.

![](./media/2f5504beac989351c5e15ca2a802057a.png)

The **AI Skills** page opens, displaying the **Basics** tab.

![](./media/149e4ce010a90895299c465f4fd6f51f.png)

:

1.  Complete the following required information in the **Basics** tab:
2.  In the **Skill Name** field, add a name.
3.  In the **Acceleration** field, select the acceleration type. If you previously defined an acceleration on a compute device that will run this skill, ensure the types match.
4.  In the **Desired Frame Rate** field, select a frames per second (fps) value. This is an upper bound and may change based on performance requirements.

![](./media/c3476db70ad31aa86a4b7a803a100889.png)

1.  To advance to the **Drag-and-Drop Nodes** tab, select **Drag-and-Drop Nodes** or **Next**.

![](./media/698c54f68b37a143851ff49a50ba6368.png)

In this tab on the left side, you see a tree of nodes to add model, transform and export nodes. Each type of node is required in a skill. Each node has an input connection on the top and an output connection on the bottom. The ellipsis in each node allows editing of the node’s properties or deletion of the node. These are dragged onto the canvas, connected with other nodes, and then configured depending on the type of node. The first node is a model to make inferences on the camera feed.

1.  Select **Add Model.**

![](./media/5a564616d81306e0c215132fc50b33f0.png)

1.  From **Add Model** list, drag an object detection model into the outline, as shown in the screenshot below.

![](./media/d8aa8e651dc121780487a1b6a2232a2d.png)

1.  Drag the **Connector** from the **Camera Input** to the model.

![Graphical user interface, application Description automatically generated](./media/181807d2a5ab7cbb9710456334c04403.png)

The **Object Detection Model** properties side panel appears on the right of the window when a model is connected. Models you have previously specified appear as options.

1.  Open the **Select Model** dropdown list.

![Graphical user interface, application Description automatically generated](./media/9d710bff56ef151ca071f676a6098d68.png)

1.  Select **pedestrian-and-vehicle-detector (Model Zoo)** per our use case. The tag for the object(s) to be detected appears.

![Graphical user interface, application Description automatically generated](./media/5e45d4265599919877215d563999e7fd.png)

1.  Select **Done.**

Now that we can detect vehicles and pedestrians, let’s add another model to classify what sort of vehicle it is. The vehicle classification model is already in the model zoo.

1.  Drag the classification model onto the canvas.
2.  Connect it the same way you did with the detection node.
3.  In the **Classification Model** information box, select **vehicle-attributes-recognition** from the **Select Model** dropdown list. The tag for the object(s) to be detected appears.

![](./media/a89e793daff10ea2b030fffb487518ac.png)

1.  Select **Done.**

To recap, the AI skill at this point detects a person and passes the inference results (x,y coordinates of the bounding box(es) in the image to the helmet recognition node. The output of the recognition node is now available for input to a transform node.

Add a Transform node

1.  From the left navigation, select the **Transform** node dropdown list. Transform nodes allow you to filter the classes you want the skill to work on. If you had a model with numerous classes, you could create a subset of the data based on the object and the confidence threshold.
2.  Drag the **Filter** node onto the canvas and connect it the same way you did with the detection node.

![](./media/410f22e98d47659c9484fdc0c42aa62a.png)

1.  In the **Filter Transform** information box**,** enter the names of the objects detected by your skill in the **Objects** field.
2.  In the **Confidence Threshold** field, enter a number for the minimum **confidence threshold.** The threshold you select is determined by your use case. For a deeper dive see [this](https://social.technet.microsoft.com/wiki/contents/articles/33879.classification-algorithms-parameters-in-azure-ml.aspx).
3.  Select **Done**.

Add an Export node

The export nodes send your actionable insights and video snippets to a broad range of locations in the cloud; your IoT hub, IoT module, or an HTTP endpoint. Locally at the edge, you will be able to create your own custom module that will allow you to integrate with other applications and systems in your customer's environment. Let’s start with an export to your IoT hub.

Send the insights to an IoT Hub

1.  From the Node/Export accordion select **Send Insights to IoT Hub** and drag it onto the canvas to connect to the **Filter** node.
2.  In the Export **(Send Insights to IoT Hub)** information box, enter **0.1** seconds into the **Delay Buffer** fiel.

![](./media/0fccade16a18ba0ce56a89c67a0585cd.png)

1.  Select **Done**.

Export a Video Snippet

![](./media/8d17d61d6466500ad06b4d45d26f0c37.png)

1.  From the **Node/Export** dropdown list, select **Export Video Snippet** and drag it onto the canvas to connect to the **Filter** node.
2.  In the side panel, enter a meaningful name that you can find in storage in the **Filename Prefix** field.
3.  Choose 10 or 20 seconds into the **Snippet Duration** field.
4.  Ticking the Yes button in the **Insights** Overlay field will include the bounding boxes and confidence level for each box.
5.  The **Delay Buffer** field defines how frequently a snippet is stored.
6.  Select **Done**.

Add Tags (optional)

Add your tags like you did with [compute devices](#_Add_Tags(Optional)).

1.  Select **Review + Create** to validate all the inputs. If any changes are required, select the **Edit** link.

![](./media/95befbf90f485cbcfd88b12bc34bed69.png)

1.  Select **Create.**

    ![](./media/828cc4d38b81b3649ab71ba9369856f7.png)

    You have now completed creating your AI skill library. All your configured skills are here.

Edit or delete an AI skill

1.  To edit or delete the AI skill select the ellipses () in the upper right of the skill tile.
2.  To edit the tile, select **Edit AI Skill**, and make your changes to the skill.
3.  
4.  To delete the tile, select **Delete**.

![](./media/b0f6e27ae642e0f28d63189037fa45f8.png)

Your AI skill is now ready to be added to a deployment.

Next steps

Now that you understand what AI skills are and how to build them Using models, transforms and exports, your next step is:

-   Go to the Deployments page to connect your to your target device.