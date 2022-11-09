# Create a custom model with Azure Percept Open-Source Project

## Overview

Models are machine learning (ML) algorithms for object identification or classification. Vision models are based on neural networks, specifically convolutional neural nets. These models are built in layers with each layer building features of the objects to be detected or classified.

In this article, we’ll guide you through the process of adding and training custom models. You can create your own custom model easily by supplying any 15 images based on your customer's use case, labeling them via a interface, and training based on our base models.

For our example use case, we will add a custom model that detects when a store has low stock levels for its products based on images of the store shelves. This model provides real time evaluation that can be used to trigger business logic. An example is [just-in-time supply chains](https://www.liveabout.com/just-in-time-jit-2221262#:\~:text=A%20just%2Din%2Dtime%20supply%20chain%20is%20one%20that%20moves%20synchronized%20with%20the%20subsequent%20operations) that save significant costs on excess stock and storage overhead.

## Add a model in POSS

The **Model** blade on the left navigation displays two options for adding models to the workspace: **Create Custom Model** or **Browse Model Zoo**.

![Screenshot of Models page](./media/1764311277118aee1939d3d6de71a70c.png)

1.  From the left navigation, select **Models**.
2.  To add a prebuilt model, select **Create Custom Model**.
3.  To reuse an existing [Azure Custom Vision (ACV) mode](https://docs.microsoft.com/en-us/azure/cognitive-services/custom-vision-service/overview), or to create one from scratch, select **Create Custom Model**.

    When prompted, choose whether the model is based on an existing model or not.

![Screenshot of Basics tab](./media/b835ebaaf679f77b65ea469bdf8d346a.png)

4.  If you select **Yes,** a dropdown list appears allowing you to choose from available models.

    ![Screenshot of Basics tab](./media/213d25b05e45e2786acbc49403b7bc5b.png)

    If you select **No**, you can create your own model. Then enter the **Model Name**, **Type**, and **Objects**.

![Screenshot of Basics tab](./media/47e4b4825eca44d66ef76dd5e54bc220.png)

![Screenshot of Basics tab with note about Classisfication models](./media/326cfc9977c999eb763901c3920b7f7d.png)

> [!NOTE] If you select **Classification** from the **Type** box, note that Classification models are in preview and you can't use them in AI Skills and Descriptions.
> 

6.  Select **Objects** and enter at least one tag for the detection model to identify. Objects should be in quotes and separated by commas.

    ![Screenshot of Basics tab](./media/ce1cc6e2e3dd4846f6ae958051c39511.png)

    These tags will be used later when you’re training the model to identify and label objects from the camera feeds.

7.  Select **Review + Create** or, to move to the **Tags** tab, select **Next**.

![Screenshot of Tags tab](./media/efdff115ebd1ac5988e09d7cd1aefac2.png)

8.  When you've finished adding tags, select **Review + Create** to move to the next page.

9.  Select **Review + Create** to confirm all the inputs. If you want to make any changes, select **Edit**.

![Screenshot of Review and Create tab](./media/bf00a8ace64970c3da335b4660153f77.png)

10.  To add the model, select **Create**.

![Screenshot of Models page displaying created model](./media/63c9948df94ad9329d4bc21f1ed04780.png)

## Model training

Training the model consists of identifying the objects to be detected or classified and then providing tagged images where the object appears. This [*supervised learning*](https://docs.microsoft.com/en-us/learn/modules/introduction-to-classical-machine-learning/) allows the model’s layers to build features layer by layer. As with any neural network, more data is correlated with a more accurate model.

1.  To train the model, **Model Properties** box, select **Train Model**.

![Screenshot of Models Properties box](./media/c552f72443fc4ba9df09f7b3ba47a0c4.png)

2.  Add any additional objects or tags, and then press **Enter**.

![Screenshot of Models page](./media/4c990c318622c694306b8c2421a0218b.png)

3.  After adding objects, select **Save.**

    Now that you have identified the objects, the next step is to enter input so the model can find objects in a camera feed.

4.  To start the tagging process, select **Capture from camera** and then select a camera from the **Select Camera** dropdown list.

![Screenshot of Capture from camera image](./media/e2250059b66fb4ba00db0709e45081d8.png)

5.  Select **Capture Image.**

![Screenshot of Capture image](./media/2cd7bb47072416fae27893e9ac52c07c.png)

6.  Select **Go to Tagging**.

![Screenshot of Capture image](./media/e58489f222cc1130967db12b2ff090a0.png)

7.  Tags you have previously identified appear as options. Select **Low stock**. The **Low Stock** tag represents those areas of the image with little or no stock.

8.  Using the mouse, draw a box around an area of the image representing low stock.   
    The best practice is to include as much of the object as possible.

![Screenshot of Image detail information](./media/9b531aa2141135ca3d8e6e153f81623c.png)

9.  To see the tagged image library, select **Done**.

    ![Screenshot of tagged image library](./media/7cb3690038117d24797fb2307ea32f23.png)

    The model requires at least fifteen images for training. More images will improve the model’s performance. You can continue to improve the model over time by adding more images and tagging them. Note that the **Tagged** slider turns blue to reflect the status of the image.

10.  To add images, select **Capture from camera**.

![Screenshot of tagged images for model](./media/2041854d4094a8f5dfc0039a29ac8356.png)

11.  Now that there are enough tagged images, select **Train.** It may take time to train the model.

![Screenshot of Models page displaying created model](./media/47a0517359d08420236a0b5745e0b3ba.png)

When **Successfully trained Model!** displays, the model is ready to be added to AI Skills.

## Next steps

Now that you understand what models are and how to add them from your model gallery, your next step is to go to the **AI Skills** page to connect your models in a cascade which can chain models and business logic together.

We also recommend the following tutorials to increase your experience:

- [Tutorial: Create an Edge AI solution with Azure Percept Open-Source Project using a prebuilt model](/docs/tutorial/Tutorial-Create-an-Edge-AI-solution-with-Azure-Percept-Open-Source-Project.md)

- [Tutorial: Create a complex AI skill with Azure Percept Open-Source Project](/docs/tutorial/Create-a-complex-AI-skill.md)

- [Tutorial: Create a custom model with Azure Percept Open-Source Project](/docs/tutorial/Create-a-custom-model.md)
