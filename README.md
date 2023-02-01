# KubeAI Application Nucleus for edge (KAN)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

KubeAI Application Nucleus for edge (KAN - in Mandarin means “to watch”, “to see”) is a solution accelerator for creating, deploying, and operating environment-aware solutions at scale that use artificial intelligence (AI) at the edge with the control and flexibility natively on your environment. Many of the KAN elements are open-sourced and leverage the open-source software (OSS) community to deliver enhanced experiences. And, as a self-managed solution, you can host the experience on your own [Kubernetes](https://kubernetes.io/) clusters.

With KAN, you have your own no- to low-code portal experience as well as APIs that you can use to develop custom AI applications in a matter of minutes. It supports running Edge AI apps by utilizing cameras, sensors, and Edge devices with different Edge runtimes and accelerators across multiple locations at scale. Since it is designed with machine learning operations (MLOps) in mind, it provides support for active learning, continuous training, and data gathering using your machine learning (ML) models running at the edge.

<p align="center">
<img src="docs/images/KAN Portal.gif" width="650"/>
</p>

# Get Started
Follow [this document](docs/tutorial/setup-guide.md) to get started in minutes. Once done learn about our concepts and follow one of the tutorials [here](./docs/KAN-TOC.md), we recommend you to start with the tutorial to [create a solution with a pre-built model](./docs/tutorial/Tutorial-Create-an-Edge-AI-solution-with-KubeAI-Application-Nucleus-for-edge-Portal.md).

> [!NOTE]
> The project is provided as a sample of how you might bring AI to the edge. Significant portions of these experiences may change without warning. The code project uses some binaries (closed source) that are under non MIT license [viewable here](/KAN%20EULA/). We advise you not to use the experince in production.

# Characteristics

<p align="center">
<a href="https://www.youtube.com/watch?v=YyhlNqHqesw"><img src="docs/images/KAN portal guide GH thumbnail.png" width="500"></a>
</p>

- **An integrated developer experience.** 
    
    You can easily build camera-based Edge AI apps using first- and third-party ML models. In one seamless flow, you can leverage pre-built models from our partner’s Model Zoo and create your own ML models with [Azure Custom Vision](https://azure.microsoft.com/en-us/services/cognitive-services/custom-vision-service/#overview).
- **Solution deployment and management experience at scale**. 
    
    KAN is Kubernetes native, so you can run the management experience wherever [Kubernetes](https://kubernetes.io/) runs; on prem, hybrid, cloud, or multi-cloud environments. You can manage your experience using [Kubernetes](https://kubernetes.io/) native tools such as [kubectl](https://kubernetes.io/docs/reference/kubectl/kubectl/), and/or our no- to low-code native web portal. Edge AI apps and assets you create are projected and managed as [Kubernetes](https://kubernetes.io/) objects, which allows you to rely on the [Kubernetes](https://kubernetes.io/) control plane to manage the state of your Edge AI assets across many environments at scale. Each KAN solution can span multiple environments meaning that your solution can have one component running on [AKS hybrid](https://docs.microsoft.com/en-us/azure-stack/aks-hci/) and another component running on [EFLOW](https://docs.microsoft.com/en-us/windows/iot/iot-enterprise/azure-iot-edge-for-linux-on-windows) and KAN can control your solution as one manageable unit.

- **Standard-based.**

    KAN is built on and supports popular industrial standards, protocols, and frameworks like, [OpenTelemetry](https://opentelemetry.io/), [Distributed Application Runtime (Dapr)](https://dapr.io/), [Message Queuing Telemetry Transport (MQTT)](https://mqtt.org/), [Open Neural Network Exchange (ONNX)](https://onnx.ai/), [Akri](https://github.com/project-akri/akri), [kubectl](https://kubernetes.io/docs/reference/kubectl/kubectl/), [Helm](https://helm.sh/), and many others. 

- **Zero-friction adoption**

    You don’t need any edge hardware, you can get started with a few commands even without any Azure Subscription, then seamlessly transition from prototype to scale. KAN has an easy-to-use no- to low-code portal experience that allows developers to create and manage Edge AI solutions in minutes instead of days or months. 

- **Azure powered and platform agnostic**

    KAN natively uses and supports Azure Edge and AI Services like [Azure IoT Hub](https://docs.microsoft.com/azure/iot-hub/), [Azure IoT Edge](https://azure.microsoft.com/services/iot-edge/), [Azure Cognitive Services](https://azure.microsoft.com/services/cognitive-services/), [Azure Storage](https://azure.microsoft.com/products/category/storage/), [Azure ML](https://azure.microsoft.com/services/machine-learning/), [Azure Monitor](https://docs.microsoft.com/azure/azure-monitor/), [Azure Arc](https://learn.microsoft.com/azure/azure-arc/overview), and so on. At the same time, it also allows you to modify the experience for use cases that require the use of other services (Azure or non-Azure) or other Open-Source Software (OSS) tools. 

# How It Works

KAN has three high-level components: portal, controller-API and agent. You can interact with KAN through its portal, Kubernetes tools like [kubectl](https://kubernetes.io/docs/reference/kubectl/kubectl/), and [Azure Arc](https://docs.microsoft.com/en-us/azure/azure-arc/overview) through [GitOps](https://docs.microsoft.com/en-us/azure/azure-arc/kubernetes/conceptual-gitops-flux2), as shown in the following diagram.

![Diagram of KAN architecture](./docs/images/KAN-architecture.png)

* **Portal** provides an intuitive graphic interface for users to create, edit and manage their intelligent edge payloads. It offers an AI model zoo, a drag-n-drop AI skill editor, live camera previews and many other features. Read more about our project [here](./docs/KAN-TOC.md).
* **Controller-API** is a Kubernetes operator that manages states of objects of a KAN API object model. Read more about KAN API [here](./docs/api/README.md).
* **Agent** offers a number of services to edge payloads, such as retrieving new AI skill definitions and reporting object states.

# KAN and API documentation

To view a list of links to information about KAN and the APIs, go to [KubeAI Application Nucleus for edge (KAN) documentation](./docs/KAN-TOC.md).

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit [Contributor License Agreements](https://cla.opensource.microsoft.com).

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

# Support

To learn more about our support structure, how to file issues and get support, visit: [How to get support](SUPPORT.md).

# Join the discussion

To report bugs, send feedbacks, or discuss any KAN related topics, please join our Discord server: 

[![Discord Banner 2](https://discordapp.com/api/guilds/1012135822188875876/widget.png?style=banner2)](https://discord.gg/RfcNBrN3vb)

# Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft 
trademarks or logos is subject to and must follow 
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.

# Privacy Notice

The software may collect information about your use of the software and send it to Microsoft.
Microsoft may use this information to provide services and improve our products and services.
You may turn off the telemetry as described in the repository or clicking settings on top right
corner. Our privacy statement is located at [Microsoft Privacy Statement](https://go.microsoft.com/fwlink/?LinkID=824704). You can learn more about data collection and use in the help documentation and our privacy
statement. Your use of the software operates as your consent to these practices.


