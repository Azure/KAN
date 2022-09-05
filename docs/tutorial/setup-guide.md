# POSS Setup Guide
## Pre-requisites
You need the following items before getting started with the self-hosting setup experience:
- An active Azure Subscription with Owner role access 
- A Resource Group created in a location where [Azure Custom Vision](https://azure.microsoft.com/en-us/global-infrastructure/services/?products=cognitive-services&regions=all) is available.
- A Kubernetes cluster, accessible using Azure CLI. If you don't have an existing Kubernetes cluster, you can create one easily using Azure Kubernetes Service (AKS): [Quickstart: Deploy an AKS cluster by using the Azure portal - Azure Kubernetes Service | Microsoft Docs](https://docs.microsoft.com/en-us/azure/aks/learn/quick-kubernetes-deploy-portal?tabs=azure-cli)
- An IoT Hub account with at least one IoT Edge device. If you don't have any IoT Edge device onboarded onto Azure IoT Hub you can follow [this guide to create an IoT Edge device using an Azure VM](CreateIoTEdgeDevice.md). Please note that if you have already used Percept on Azure Stack HCI's WAC Extention to onboard a VM, the VM is already automatically onboarded as an IoT Edge device onto Azure IoT Hub. 


- Have "Storage account contributor" role assignment under your subscription. If you don't have the role assignment, you can add a new role assignment to your subscription for "Storage account contributor" by clicking on your subscription --> Access control --> Add role assignment (see screenshot) --> search for "Storage account contributor" (not the classic one) --> click next --> Add member --> select your account --> review and assign

![image](https://user-images.githubusercontent.com/10191339/186480363-7eb2a5fa-66e0-49f5-a4c6-7b9fc0caee9b.png)

## Setup Process
1. Please go to your Azure portal: [https://portal.azure.com/](https://portal.azure.com/)
2. Open Azure Cloud CLI by clicking on the CLI  button in the top right corner of the portal

![image](https://user-images.githubusercontent.com/10191339/186480918-c366a912-c036-4ee7-ada8-d7ca4ad4d054.png)

3. Run the following 2 commands (one at a time and in order) in your Azure Cloud CLI environment (note run in home, not in a subdirectory) to update the Helm version of your environment as there is an issue with the current version of Helm installed as part of Azure Cloud CLI environment:

```
    wget -O fix-helm-issue.sh "https://possfiles.blob.core.windows.net/setup/Private-Alpha/fix-helm-issue.sh"
    
    source fix-helm-issue.sh
```

4. Run the following command to download the setup installer while substituting <download-url> with your desired download URL corresponding to a specific version of installer and POSS release using the table below:

```
    wget -O poss-installer.sh "download-url"
```
Installation Options:


|Setup Installer Version	|POSS Version	|Download URL	|Supported Accelerators for Edge Workloads	|Released Date|
|---------------------------|---------------|---------------|-------------------------------------------|-------------|
|0.38.2	|0.38.2 |https://possfiles.blob.core.windows.net/setup/Private-Alpha/POSS-V0.38.2-Installer0.38.2.sh	|Nvidia dGPU (e.g. T4, A2, etc), Nvidia Jetson (e.g. Orin), x64 CPU	|09/02/2022 |
|0.38.1	|0.38.0 |https://possfiles.blob.core.windows.net/setup/Private-Alpha/POSS-V0.38.0-Installer0.38.1.sh	|Nvidia dGPU (e.g. T4, A2, etc), Nvidia Jetson (e.g. Orin), x64 CPU	|08/30/2022 |
 
    
**NOTE:** before starting the installation process by the above command, please make sure Azure CLI's az context is set to your desired Azure Subscription: 
    
    az account show

If the subscription context is not correct, you can use the following command to set the right Azure subscription context: 
    
    az account set -s <your subscription name or id>

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


The installation will take a couple of minutes. **Note:** If you face any issues towards the end of the installation to download our Helm charts to install either "symphony" or "voe", please uninstall the experience using the commands below and retry running the installer script in a couple of minutes. Azure is facing some issues with the Azure Container Registry not handling all download requests successfully due to high load so trying again in a couple of minutes can solve your issue.  
    
Once completed you can find the IP address of the portal to access it by running the following command in your Azure Cloud CLI command line: 

``kubectl get svc -A``

Use the LoadBalancer IP address as shown below:

![image](https://user-images.githubusercontent.com/10191339/186488705-03d3af9b-4536-4575-afe8-978b8a692a73.png)

## Limit access to the POSS Portal
Once you have the LoadBalancer IP address as shown above:
- Open the resource group associated with your AKS cluster (not the AKS cluster itself)
- Open the network security (NSG) resource
- For each line that references the LoadBalancer IP address, click on the inbound security rule, change the source IP address range to the network you want to allow access to the portal, for example your home or corporate IP address space in CIDR notation.
    - e.g. 203.0.113.0/24

## Uninstalling the experience
In your Azure Cloud CLI instance run the following two commands, in order below, to uninstall POSS:
1. `helm uninstall voe`
2. `helm uninstall symphony`

    
## Reporting Issues and Bugs
Please report any issues or bugs you face using [repository's issues page](https://github.com/Azure/perceptoss/issues).

## Next steps

Now that you have successfully setup POSS experience onto your Kubernetes environment, we recommend the following resources:

-   [Tutorial: Create an Edge AI solution with Azure Percept Open-Source Project using a prebuilt model](Tutorial-Create-an-Edge-AI-solution-with-Azure-Percept-Open-Source-Project.md)
-   [Introduction to POSS Portal's Core Concepts](concepts-azure-percept-for-open-source%20.md)
