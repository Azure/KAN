# Percept Open Source Project (POSS)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Percept Open Source Project (POSS) is an open-source project that accelerates and simplifies the journey of building vision-based intelligent edge solutions using Machine Learning (ML). POSS helps you with extracting insights and actions from RTSP IP cameras using a no-code UI that runs and processes streams locally on your edge device.

# Overview

Gaining meaningful insights from the physical world can be quite complex and time consuming. Camera is quickly becoming the one universal sensor that can capture the essence of the physical world for many different use cases. To be able to reason about your desired events happening in the physical world using cameras you need to be able to ingest, process and reason about many camera streams at once. Creating a video ingestion process with only 1 camera is not an easy task but creating a scalable, yet extensible video pipeline is even more difficult. In addition, understanding things/objects in the physical world requires algorithms that are not easy to build without specialized knowledge and resources. 

<p align="center">
<img src="assets/VoEGH.gif" width="800"/>
</p>

POSS combines the power of Azure services such as Custom Vision and Video Analyzer in one simple and easy to use local UI that helps you:
- Connect and view your IP cameras
- Train your own custom ML models from scratch using training data from your IP cameras
- Create a more complex AI Skill/Logic by combining your custom ML models with already trained models from our model zoo
- Deploy your hardware optimized ML models on your IP camera streams to extract insights and create actions locally or in the cloud

# Get Started


# Characteristics 
* **Kubernetes-native.** Works nicely with beloved [Kubernetes](https://kubernetes.io/) tools and open-source projects like [kubectl](https://kubernetes.io/docs/reference/kubectl/kubectl/), [Helm](https://helm.sh/), [Istio](https://istio.io/), and [Akri](https://github.com/project-akri/akri).   <sub>[:blue_book: more...](./docs/p4e/architecture/k8s-support.md) </sub>

* **Arc-enabled.** Manage your intelligent apps and distributed edge clusters using [Azure Arc](https://azure.microsoft.com/en-us/services/azure-arc/). <sub>[:blue_book: more...](./docs/p4e/architecture/arc-enabled.md) </sub>

* **Production-grade AI.** High-quality, hardware-accelerated AI models from our partners like [Nvidia](https://www.nvidia.com/en-us/) and [Intel](https://www.intel.com/). Allows you to bring your own models using different AI platforms like [TensorFlow](https://www.tensorflow.org/), [ONNX](https://onnx.ai/), [CoreML](https://developer.apple.com/machine-learning/core-ml/), [OpenVino](https://docs.openvino.ai/latest/index.html), [Vison AI](https://cloud.google.com/vision) and others. <sub>[:blue_book: more...](./docs/p4e/architecture/production-grade-ai.md) </sub>

* **Zero-friction adoption.** Get started with POSS with a single command line, with no hardware or Azure subscription needed. <sub>[:blue_book: more...](./docs/p4e/architecture/zero-friction-adoption.md) </sub>

* **Full project lifecycle.** Seamlessly transit from prototype to pilot to production at scale. <sub>[:blue_book: more...](TBD) </sub>

* **End-to-end Security.** Supports device attestation, end-to-end encryption, model protection at rest and during transition. Extensible to support secured enclaves.  <sub>[:blue_book: more...](TBD) </sub>

* **Light weight with zero external dependencies.** Works in fully disconnected mode on various Kubernetes distributions like [K3s](https://k3s.io/), [Kind](https://kind.sigs.k8s.io/) and [MicroK8s](https://microk8s.io/). <sub>[:blue_book: more...](./docs/p4e/architecture/k8s-support.md) </sub>

* **Full spectrum device management.** Manages all type of devices from heavy edge to tiny edge, including Kubernetes clusters, server-grade machines, PCs, mobile devices, MPUs, MCUs and ECUs. POSS also supports **agentless** device management so that you run nothing but your workload on your target devices. <sub>[:blue_book: more...](./docs/p4e/architecture/agentless-device.md) </sub>

* **Azure-powered.** Natively support Azure edge and AI services like [Azure IoT Hub](https://docs.microsoft.com/en-us/azure/iot-hub/), [Azure Digital Twins](https://azure.microsoft.com/en-us/services/digital-twins), [Azure ML](https://azure.microsoft.com/en-us/services/machine-learning/), [Azure Cognitive Services](https://azure.microsoft.com/en-us/services/cognitive-services/) and [Azure Monitor](https://docs.microsoft.com/en-us/azure/azure-monitor/). <sub>[:blue_book: more...](TBD) </sub>

* **Standard-based.** Supports popular industrial standards, protocols and frameworks like [OPC-UA](https://opcfoundation.org/about/opc-technologies/opc-ua/), [ONVIF](https://www.onvif.org/), [OpenTelemetry](https://opentelemetry.io/), [CloudEvents](https://cloudevents.io/), [MQTT](https://mqtt.org/) and many others. <sub>[:blue_book: more...](TBD) </sub>

* **Platform agnostic**. Works great on Azure. Works as well on [AWS](https://aws.amazon.com/) and [GCP](https://cloud.google.com/gcp). POSS agent works on [Windows](https://www.microsoft.com/en-us/windows), [macOS](https://www.apple.com/macos/), [Linux](https://www.linux.com/what-is-linux/) (including [Yocto](https://www.yoctoproject.org/)), [Andriod](https://www.android.com/) and [RTOS](https://azure.microsoft.com/en-us/services/rtos/). <sub>[:blue_book: more...](TBD) </sub>

* **Hybrid topologies.** Manages payloads spanning [Azure IoT Edge](https://docs.microsoft.com/en-us/azure/iot-edge/about-iot-edge?view=iotedge-2020-11) devices, [Azure Sphere](https://docs.microsoft.com/en-us/azure-sphere/product-overview/what-is-azure-sphere) devices, [Azure Stack HCI](https://azure.microsoft.com/en-us/products/azure-stack/hci/), [Windows for IoT](https://docs.microsoft.com/en-us/windows/iot/), [EFLOW](https://docs.microsoft.com/en-us/windows-hardware/manufacture/desktop/edib/edib-eflow?view=windows-11), AKS-IoT as well as the cloud. Also supports cascaded deployments through a POSS control plane tree. <sub>[:blue_book: more...](TBD) </sub>

* **Embrace OSS.** POSS is fully open sourced. And it leverage the OSS community to deliver enhanced experiences. For example, it can be used together with [Dapr](https://dapr.io/) to provide a platform-agnostic programming model to intelligent edge developers. <sub>[:blue_book: more...](TBD) </sub>

# How It Works


# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft 
trademarks or logos is subject to and must follow 
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.

# Privacy Notice

The software may collect information about your use of the software and send it to Microsoft.
Microsoft may use this information to provide services and improve our products and services.
You may turn off the telemetry as described in the repository or clicking settings on top right
corner. Our privacy statement is located at [https://go.microsoft.com/fwlink/?LinkID=824704](https://go.microsoft.com/fwlink/?LinkID=824704)
. You can learn more about data collection and use in the help documentation and our privacy
statement. Your use of the software operates as your consent to these practices.
