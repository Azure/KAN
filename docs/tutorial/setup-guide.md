# POSS Setup Guide


## Pre-requisites
You need the following items before getting started with the self-hosting setup experience:
- An active Azure Subscription
- A Kubernetes cluster, accessible using Azure CLI. If you don't have an existing Kubernetes cluster, you can create one easily using Azure Kubernetes Service (AKS): [Quickstart: Deploy an AKS cluster by using the Azure portal - Azure Kubernetes Service | Microsoft Docs](https://docs.microsoft.com/en-us/azure/aks/learn/quick-kubernetes-deploy-portal?tabs=azure-cli)
- At lease one IoT Edge device onboarded to an IoTHub (should be under the same subscription you are using P4OSS Installer below). If you don't have an edge device already (like Percept on HCI VM), you can use an Azure VM with IoTEdge installed and configured on it easily using the following guide: [Run Azure IoT Edge on Ubuntu Virtual Machines | Microsoft Docs](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-install-iot-edge-ubuntuvm?view=iotedge-2020-11)

## Setup Process
1. Please go to your Azure portal: [https://portal.azure.com/](https://portal.azure.com/)
2. Open Azure Cloud CLI by clicking on the CLI  button in the top right corner of the portal

    image
3. Run the following command to download the setup installer while substituting <download-url> with your desired download URL corresponding to a specific version of installer and POSS release using the table below:

    `wget -O poss-installer.sh "download-url"`

    table
    
    >**NOTE:** before starting the installation process by the above command, please make sure Azure CLI's az context is set to your desired Azure Subscription: `az account show`. If the subscription context is not correct, you can use the following command to set the right Azure subscription context: `az account set -s <your subscription name or id>`

4. Start the installation process by running the following command:

    `bash poss-installer.sh`

5. The first question that you will be asked is to select whether you want to install POSS onto an AKS cluster or your existing K8s cluster which is included in your kubeconfig context. If you would like to install on AKS please select 1 otherwise select 2. For this guide we select to use an AKS cluster. After selecting 1, you will be shown a list of AKS clusters under your subscription. Please select the AKS cluster that you would like to install POSS on.

    image
6. Next you are asked whether you would like to create a new storage account or use an already existing one. If you choose to create a new one, you will be asked to select from list of resource groups available under your subscription and then a name for your storage account. If you select to choose from already existing storage accounts, you will be shown a list of storage accounts under your subscription to select from.

    image
7. Next you are asked whether you would like to create a new blob container within your storage account or use an already existing one. If you choose to create a new one, you will be asked a name for your blob container within your storage account. If you select to choose from already existing blob container, you will be shown a list of storage accounts under your storage account to select from.

    image
8. Next you are asked whether you would like to create a new custom vision account or use an already existing one. If you choose to create a new one, you will be asked to select from list of resource groups available under your subscription and then a name for your custom vision account. If you select to choose from already existing custom vision accounts, you will be shown a list of custom vision accounts under your subscription to select from.

    image
9. Next you are asked whether you would like to create a service principal or use an already existing one. If you choose to create a new one, you will be asked to select a name for your service principal. If you select to choose from already existing one, you have the option of selecting from a list of existing service principals or providing the name of your existing service principal directly (recommended as there can be too many service principals to show with the first option).

    image
10. Lastly, the installer asks you to confirm your choices. You can confirm the selection by answering "y" to the question.

    image

The installation will take a couple of minutes. Once completed you can find the IP address of the portal to access it by running the following command in your Azure Cloud CLI command line: 

``kubectl get svc -A``

Use the LoadBalancer IP address as shown below:

image


## Uninstalling Process
In your Azure Cloud CLI instance run the following two commands, in order below, to uninstall POSS:
1. `helm uninstall voe`
2. `helm uninstall symphony`

## Reporting Issues and Bugs
Please report any issues or bugs you face using [repository's issues page](https://github.com/Azure/perceptoss/issues).