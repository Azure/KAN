# POSS Setup Guide
## Overview
Percept Open-Source Project (POSS) is a framework that simplifies the journey of building/deploying/managing sensor-based edge AI solutions at scale natively on Kubernetes. It seamlessly allows you to create, deploy and operate edge AI solutions with the control and flexibility of open-source. Some of its capabilities are as follows:

- Integrated developer Exp: easily build sensor-based edge AI apps using 1st/3rd ML models
- Management Exp at scale: control plane on Kubernetes to centrally define, deploy and manage edge AI assets and apps with native support for Azure Arc and GitOps
- Standard-based: Built on popular industrial standards/technologies such as Kubernetes, Dapr, ONVIF, MQTT, ONNX, Akri, kubectl, Helm, etc

## Pre-requisites
You need the following items before getting started with the self-hosting setup experience:
- An active Azure Subscription
- A Resource group
- A Kubernetes cluster, accessible using Azure CLI. If you don't have an existing Kubernetes cluster, you can create one easily using Azure Kubernetes Service (AKS): [Quickstart: Deploy an AKS cluster by using the Azure portal - Azure Kubernetes Service | Microsoft Docs](https://docs.microsoft.com/en-us/azure/aks/learn/quick-kubernetes-deploy-portal?tabs=azure-cli)
- An IoT Hub with at lease one IoT Edge device (should be under the same subscription you are using P4OSS Installer below). If you don't have IoT Hub or IoT edge device:
    - Create an IoT hub by going to the Azure portal search for IoT Hub and create new, follow the defaults.
    - Add IoT Edge device, Go to your IoT Hub --> IoTEdge --> Add IoT Edge device --> Go with the defaults
- Once added click on your IoT edge device and save the primary connection string, you will need it if you choose to run it as an Azure VM.
- If you don't have an edge device already (like Percept on HCI VM), you can use an Azure VM with IoTEdge installed and configured on it easily using the following guide: Run Azure IoT Edge on Ubuntu Virtual Machines | Microsoft Docs, when following the Arm template to create the VM:
    - Add the connection string that you saved in the previus step. 
    - Type Standard_DS3_v2 for the VM size instead of the DS1 which is the default
- Add a new role assignment to your subscription for "Storage account contributor", click on your subscription --> Access control --> Add role assignment (see screenshot) --> search for "Storage account contributor" (not the classic one) -->click next --> Add member --> select your account --> review and assign

![image](https://user-images.githubusercontent.com/10191339/186480363-7eb2a5fa-66e0-49f5-a4c6-7b9fc0caee9b.png)

## Setup Process
1. Please go to your Azure portal: [https://portal.azure.com/](https://portal.azure.com/)
2. Open Azure Cloud CLI by clicking on the CLI  button in the top right corner of the portal

![image](https://user-images.githubusercontent.com/10191339/186480918-c366a912-c036-4ee7-ada8-d7ca4ad4d054.png)

3. Run the following 2 commands (one at a time) in your Azure Cloud CLI environment (note run in home, not in a subdirectory) to update the Helm version of your environment as there is an issue with the current version of Helm installed as part of Azure Cloud CLI environment:

```
    wget -O fix-helm-issue.sh 
    "https://p4efiles.blob.core.windows.net/installers/Private-Alpha/fix-helm-issue.sh"
    source fix-helm-issue.sh
```

4. Run the following command to download the setup installer while substituting <download-url> with your desired download URL corresponding to a specific version of installer and POSS release using the table below:

```
    `wget -O poss-installer.sh "download-url"`
```
Installation Options:


|Setup Installer Version	|POSS Version	|Download URL	|Supported Accelerators for Edge Workloads	|Released Date|
|---------------------------|---------------|---------------|-------------------------------------------|-------------|
|0.3.0	|0.37.12	|https://p4efiles.blob.core.windows.net/installers/Private-Alpha/POSS-V0.37.12-Installer0.3.0.sh	|Nvidia dGPU (e.g. T4, A2, etc), Nvidia Jetson (e.g. Orin), x64 CPU	|08/23/2022 |
 
    
**NOTE:** before starting the installation process by the above command, please make sure Azure CLI's az context is set to your desired Azure Subscription: 
    
    `az account show` 

If the subscription context is not correct, you can use the following command to set the right Azure subscription context: 
    
    `az account set -s <your subscription name or id>`

5. Start the installation process by running the following command:

    `bash poss-installer.sh`

6. The first question that you will be asked is to select whether you want to install POSS onto an AKS cluster or your existing K8s cluster which is included in your kubeconfig context. If you would like to install on AKS please select 1 otherwise select 2. For this guide we select to use an AKS cluster. After selecting 1, you will be shown a list of AKS clusters under your subscription. Please select the AKS cluster that you would like to install POSS on.

![image](https://user-images.githubusercontent.com/10191339/186487409-c325c76c-0771-409c-9c4a-4babb666d9de.png)
    
7. Next you are asked whether you would like to create a new storage account or use an already existing one. If you choose to create a new one, you will be asked to select from list of resource groups available under your subscription and then a name for your storage account. If you select to choose from already existing storage accounts, you will be shown a list of storage accounts under your subscription to select from.

![image](https://user-images.githubusercontent.com/10191339/186487829-cda5b6db-85c2-49af-9c3f-0f97cef4b019.png)

8. Next you are asked whether you would like to create a new blob container within your storage account or use an already existing one. If you choose to create a new one, you will be asked a name for your blob container within your storage account. If you select to choose from already existing blob container, you will be shown a list of storage accounts under your storage account to select from.

![image](https://user-images.githubusercontent.com/10191339/186488033-4bd85dfc-550e-4320-b242-30013828aefe.png)

9. Next you are asked whether you would like to create a new custom vision account or use an already existing one. If you choose to create a new one, you will be asked to select from list of resource groups available under your subscription and then a name for your custom vision account. If you select to choose from already existing custom vision accounts, you will be shown a list of custom vision accounts under your subscription to select from.

![image](https://user-images.githubusercontent.com/10191339/186488323-da75715d-9128-4bff-821e-d88547abc77c.png)

10. Next you are asked whether you would like to create a service principal or use an already existing one. If you choose to create a new one, you will be asked to select a name for your service principal. If you select to choose from already existing one, you have the option of selecting from a list of existing service principals or providing the name of your existing service principal directly (recommended as there can be too many service principals to show with the first option).

 ![image](https://user-images.githubusercontent.com/10191339/186488469-ff1ae26e-2674-482e-a2f8-0717860fdad2.png)

11. Lastly, the installer asks you to confirm your choices. You can confirm the selection by answering "y" to the question.

![image](https://user-images.githubusercontent.com/10191339/186488549-4c74bbc5-4f49-4bb7-a103-18e6452adfca.png)


The installation will take a couple of minutes. Once completed you can find the IP address of the portal to access it by running the following command in your Azure Cloud CLI command line: 

``kubectl get svc -A``

Use the LoadBalancer IP address as shown below:

![image](https://user-images.githubusercontent.com/10191339/186488705-03d3af9b-4536-4575-afe8-978b8a692a73.png)

## Limit access to the VoE Portal
Once you have the LoadBalancer IP address as shown above:
- Open the resource group associated with your AKS cluster (not the AKS cluster itself)
- Open the network security (NSG) resource
- For each line that references the LoadBalancer IP address, click on the inbound security rule, change the source IP address range to corpnet+your home IP
    - 131.107.0.0/16,<your_home_ip_address>/20
    - e.g. 131.107.0.0/16,174.61.128.0/20    

## Uninstalling the experience
In your Azure Cloud CLI instance run the following two commands, in order below, to uninstall POSS:
1. `helm uninstall voe`
2. `helm uninstall symphony`

## Join Azure GitHub org in order to access VoE GitHub
Using your GitHub account, Sign in to the following GitHub group and select ‘Request to join’ –  https://repos.opensource.microsoft.com/orgs/Azure, search for PerceptOSS.
    
You should see “Your linked GitHub account is a member of the Azure GitHub organization.”
If you don’t, Link your GitHub account to Microsoft here https://repos.opensource.microsoft.com/Azure/join
    
## Reporting Issues and Bugs
Please report any issues or bugs you face using [repository's issues page](https://github.com/Azure/perceptoss/issues).
