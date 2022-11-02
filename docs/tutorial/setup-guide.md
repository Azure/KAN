# Azure Percept Open-Source Project: Setup guide

## Prerequisites

You need the following items before you start working with the self-hosting setup experience:

- An active **Azure subscription** with **Owner** role access. 
- A **resource group** created in a location where [Azure Custom Vision](https://azure.microsoft.com/en-us/global-infrastructure/services/?products=cognitive-services&regions=all) is available.
- A **Kubernetes cluster** accessible using [Azure CLI](https://github.com/Azure/cli). 

  If you don't have an existing Kubernetes cluster, you can easily create one using the Azure Kubernetes Service (AKS). For more information, visit [Quickstart: Deploy an Azure Kubernetes Service (AKS) cluster using the Azure portal](https://docs.microsoft.com/en-us/azure/aks/learn/quick-kubernetes-deploy-portal?tabs=azure-cli).
    
- An **IoT Hub account** with at least **one IoT Edge device**. 

  If you don't have any IoT Edge device onboarded onto Azure IoT Hub,  visit [Quickstart: Deploy your first IoT Edge module to a virtual Linux device](CreateIoTEdgeDevice.md) for information on how to do so. Note that if you have already used Percept on Azure Stack HCI's WAC Extention to onboard a VM, the VM is already automatically onboarded as an IoT Edge device onto Azure IoT Hub. 

- Have **Storage account contributor** role assignment under your subscription. 

  If you don't have the required role assignment, add a new role assignment to your subscription for **Storage account contributor** by following these steps: 
  
    1. Select your subscription. 
    2. Select **Access control**, and then select **Add role assignment** (see screenshot).
    3. Search for **Storage account contributor** (not the classic one).
    4. Then select **Next**, select **Add member**, select your account, and then select **Review and assign**.

![image](https://user-images.githubusercontent.com/10191339/186480363-7eb2a5fa-66e0-49f5-a4c6-7b9fc0caee9b.png)

## Setup process

To begin the setup process:

1. Go to your [Azure portal](https://portal.azure.com/).
2. Open Azure Cloud CLI by selecting the **CLI** button in the top right corner of the portal.

![image](https://user-images.githubusercontent.com/10191339/186480918-c366a912-c036-4ee7-ada8-d7ca4ad4d054.png)

3. Run the following two commands; one at a time, and in the order shown here. 

   In your Azure Cloud CLI environment (note run in home, not in a subdirectory), update the Helm version of your environment as there is an issue with the current version of Helm installed as part of Azure Cloud CLI environment:

```
    wget -O fix-helm-issue.sh "https://possfiles.blob.core.windows.net/setup/Private-Alpha/fix-helm-issue.sh"
    
    source fix-helm-issue.sh
```

4. Run the following command to download the setup installer. Substitute <download-url> with the required download URL corresponding to a specific version of installer and POSS release using the table below:

```
    wget -O poss-installer.sh "download-url"
```

**Installation Options**

|Setup Installer Version	|POSS Version	|Download URL	|Supported Accelerators for Edge Workloads	|Released Date|
|---------------------------|---------------|---------------|-------------------------------------------|-------------|
|0.38.2	|0.38.2 |https://possfiles.blob.core.windows.net/setup/Private-Alpha/POSS-V0.38.2-Installer0.38.2.sh	|Nvidia dGPU (for example, T4, A2, etc), Nvidia Jetson (for example, Orin), x64 CPU	|09/02/2022 |
|0.38.1	|0.38.0 |https://possfiles.blob.core.windows.net/setup/Private-Alpha/POSS-V0.38.0-Installer0.38.1.sh	|Nvidia dGPU (e.g. T4, A2, etc), Nvidia Jetson (for example, Orin), x64 CPU	|08/30/2022 |
 
    
> [!NOTE]
> Before starting the installation process using the above command, make sure Azure CLI's `az` context is set to your Azure subscription: 
>    
>    `az account show`
>
>If the subscription context is not correct, you can use the following command to set the right Azure subscription context: 
>    
>    `az account set -s <your subscription name or id>`

5. Start the installation process by running the following command:

    `bash poss-installer.sh`

6. When you're asked to select whether you want to install POSS onto an AKS cluster or your existing K8s cluster which is included in your kubeconfig context. 
    
    1. If you want to install on AKS select **1**, otherwise select **2**. 
    
       For this guide, select **1** to use an AKS cluster. 
    
    2. After you select **1**, a list of AKS clusters appears under your subscription. 
    
       Select the AKS cluster that you want to install POSS on.

![image](https://user-images.githubusercontent.com/10191339/186487409-c325c76c-0771-409c-9c4a-4babb666d9de.png)
    
7. Next you're asked whether you want to create a new storage account or use an already existing one. 
  
    - To create a new one, make a selection from the list of resource groups available under your subscription and then enter a name for your storage account. 
    
    - To choose an already existing storage accounts, make a selection from the list of storage accounts under your subscription.

![image](https://user-images.githubusercontent.com/10191339/186487829-cda5b6db-85c2-49af-9c3f-0f97cef4b019.png)

8. Next, you're asked whether you want to create a new blob container within your storage account or use an already existing one. 
    
    - To create a new one, enter a name for your blob container within your storage account. 
    
    - To choose from already existing blob container, make a selection from the list of storage accounts under your storage account.

![image](https://user-images.githubusercontent.com/10191339/186488033-4bd85dfc-550e-4320-b242-30013828aefe.png)

9. Next you're asked whether you want to create a new custom vision account or use an already existing one. 
    
    - To create a new one, make a selection from the displayed list of resource groups available under your subscription and then enter a name for your custom vision account. 
    
    - If you want to select from already existing custom vision accounts, make a selection from the displayed list of custom vision accounts under your subscription.

![image](https://user-images.githubusercontent.com/10191339/186488323-da75715d-9128-4bff-821e-d88547abc77c.png)

10. Next, you're asked whether you want to create a service principal or use an already existing one. 
    
    - To create a new one, enter a name for your service principal. 
    
    - To choose an already existing one, make a selection from the list of existing service principals or provide the name of your existing service principal directly. (This option is recommended as there can be too many service principals to show with the first option).

 ![image](https://user-images.githubusercontent.com/10191339/186488469-ff1ae26e-2674-482e-a2f8-0717860fdad2.png)

11. Lastly, the installer asks you to confirm your choices. Confirm your selections by answering **y** to the question.

![image](https://user-images.githubusercontent.com/10191339/186488549-4c74bbc5-4f49-4bb7-a103-18e6452adfca.png)


The installation may take a few minutes. 
    
> [!NOTE]
> If you face any issues towards the end of the installation to download our Helm charts to install either **symphony** or **voe**, uninstall the experience using the commands below and retry running the installer script in a few minutes. 
>
> Azure is currently facing some issues with the Azure Container Registry not handling all download requests successfully due to high load. Trying again in a few minutes may resolve the issue.  
    
12. When the installation has completed, you can find the IP address of the portal to access it by running the following command in your Azure Cloud CLI command line: 

   ``kubectl get svc -A``

   Use the LoadBalancer IP address as shown below:

![image](https://user-images.githubusercontent.com/10191339/186488705-03d3af9b-4536-4575-afe8-978b8a692a73.png)

## Limit access to the POSS portal
    
Once you have the LoadBalancer IP address as shown above:
1. Open the resource group associated with your AKS cluster (not the AKS cluster itself).
2. Open the network security (NSG) resource.
3. For each line that references the LoadBalancer IP address:
  
   1. Select the inbound security rule.
   2. Change the source IP address range to the network you want to allow access to the portal. For example, your home or corporate IP address space in CIDR notation.
  

## Uninstall POSS
To uninstall POSS, in your Azure Cloud CLI instance, run the following two commands in the order shown below:

    1. `helm uninstall voe`
    2. `helm uninstall symphony`
 
## Reporting Issues and Bugs
    
Report any issues or bugs you face using the [repository's issues page](https://github.com/Azure/perceptoss/issues).

## Next steps

Now that you have successfully setup POSS experience onto your Kubernetes environment, we recommend continuing with the following resources:

-   [Tutorial: Create an Edge AI solution with Azure Percept Open-Source Project using a prebuilt model](Tutorial-Create-an-Edge-AI-solution-with-Azure-Percept-Open-Source-Project.md)
-   [Introduction to Azure Percept for Open-Source Project: Core concepts](concepts-azure-percept-for-open-source%20.md)
