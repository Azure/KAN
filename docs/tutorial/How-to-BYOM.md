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
