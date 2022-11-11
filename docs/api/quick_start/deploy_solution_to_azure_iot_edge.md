# Symphony Quickstart: Deploying a simulated temperature sensor solution to an Azure IoT Edge device

Ready to jump into actions right away? This quickstart walks you through the steps of setting up a new Symphony control plane on your Kubernetes cluster and deploying a new Symphony solution instance to an Azure IoT Edge device.

> [!NOTE]
> The following steps are tested under a Ubuntu 20.04.4 TLS WSL system on Windows 11. However, they should work for Linux, Windows, and MacOS systems as well.

<!-- ![IoT Edge](../../assets/quick-start-iot-edge.png)-->

## 0. Prerequisites

* [Helm 3](https://helm.sh/) - Required to deploy Symphony.
* [kubectl](https://kubernetes.io/docs/reference/kubectl/kubectl/): Configured with the Kubernetes cluster you want to use as the default context. Note that if you use cloud shell, kubectl is already configured.
* [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/)

## 1. Deploy Symphony using Helm

The easiest way to install Symphony is to use Helm:
```bash
helm install symphony oci://possprod.azurecr.io/helm/symphony --version 0.40.58
```

Or, if you already have the ```symphony-k8s``` repository cloned:
```bash
cd symphony-k8s/helm
helm install symphony ./symphony
```

## 2. Create an IoT Edge device

These steps create a new resource group, a new IoT Hub, and a new IoT Edge device. You can also choose to use an existing IoT Edge device.

```bash
# install Azure IoT extension if needed
az extension add --name azure-iot

# create resource group
az group create --name s8c-demo --location westus2

# create IoT Hub
az iot hub create --name s8chub --resource-group s8c-demo --sku S1

# create a IoT Edge device
az iot hub device-identity create --device-id s8c-vm --hub-name s8chub --edge-enabled

# get IoT Edge device connection string
az iot hub device-identity connection-string show --device-id s8c-vm --resource-group s8c-demo --hub-name s8chub
```

## 3. Register a Linux VM as an IoT Edge device

You need to prepare a Linux VM or physical device for IoT Edge. In this guide, you'll create a new Linux VM:

```bash
# create vm
az vm create --resource-group s8c-demo --name s8c-vm --image UbuntuLTS --admin-username hbai --generate-ssh-keys --size Standard_D2s_v5

# SSH into the machine
ssh hbai@<public IP of your VM>

# update repo and signing key
wget https://packages.microsoft.com/config/ubuntu/18.04/multiarch/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb

# install container engine
sudo apt-get update; \
  sudo apt-get install moby-engine

# install IoT Edge engine runtime
sudo apt-get update; \
  sudo apt-get install aziot-edge defender-iot-micro-agent-edge

# update iotedge setting
sudo iotedge config mp --connection-string '<IoT Edge device connection string>'
```

## 4. Register the IoT Edge device as a Symphony Target

Create a new YAML file that describes a Symphony Target. Use the following to submit the file:

  kubectl create -f <filename>

Use the following to apply any changes:

    kubectl apply -f <filename> :

> [!NOTE]
> You can get a sample of this file under ```symphony-k8s/samples/simulated-temperature-sensor/target.yaml```:

```yaml
apiVersion: fabric.symphony/v1
kind: Target
metadata:
  name: s8c-vm
spec:
  name: s8c-vm
  topologies:
  - bindings:
    - role: instance
      type: providers.target.azure.iotedge
      parameters:
        name: "iot-edge"
        keyName: "iothubowner"
        key: "<IoT Hub Key>"
        iotHub: "s8chub.azure-devices.net"
        apiVersion: "2020-05-31-preview"
        deviceName: "s8c-vm"
```

> [!NOTE]
> The above sample doesn't deploy a **Symphony Agent**, which is optional. To deploy an Symphony agent as an  IoT Edge module, see a sample target definition in the ```symphony-k8s/samples/voe/default/target.yaml``` folder.

## 5. Create the Symphony Solution

The following YAMl file describes a Symphony Solution with a single component, which is based on the ```mcr.microsoft.com/azureiotedge-simulated-temperature-sensor:1.0``` container. Use the following to submit the file:

  kubectl create -f <filename>

Use the following to apply any changes:

  kubectl apply -f <filename> 

```yaml
apiVersion: solution.symphony/v1
kind: Solution
metadata:
  name: simulated-temperature-sensor
spec:
  components:
  - name: "simulated-temperature-sensor"
    properties:
      container.version: "1.0"
      container.type: "docker"
      container.image: "mcr.microsoft.com/azureiotedge-simulated-temperature-sensor:1.0"
      container.createOptions: ""
      container.restartPolicy: "always"
```

## 6. Create the Symphony Solution Instance

A Symphony Solution Instance maps a Symphony Solution to one or multiple Targets. The following artifacts maps the ```simulated-temperature-sensor``` solution to the ```voe``` target above. Use the following to submit the file:

  kubectl create -f <filename>

Use the following to apply any changes:

  kubectl apply -f <filename> 

> [!NOTE]
> You can get a sample of this file in the ```symphony-k8s/samples/simulated-temperature-sensor/instance.yaml``` folder.

```yaml
apiVersion: solution.symphony/v1
kind: Instance
metadata:
  name: my-sensor
spec:
  solution: simulated-temperature-sensor
  target:
    name: s8c-vm
```

## 7. Verification

To examine all the Symphony objects you've created:

```bash
kubectl get targets
kubectl get solutions
kubectl get instances
```

On the IoT Hub page, verify all IoT Edge modules are up and running.

<!-- ![IoT Edge](../images/iot-edge.png)-->

## 8. Clean up Symphony objects

To delete all Symphony objects:

```bash
kubectl delete instance my-instance-2
kubectl delete solution simulated-temperature-sensor
kubectl delete target voe-target
```
## 9. Remove the Symphony control plane (optional)

To remove the Symphony control plane:

```bash
helm delete symphony
```


# Next step

* [Symphony Quickstart - Managing RTSP cameras connected to a gateway](/docs/api/quick_start/manage_rtsp_cameras.md)
* [Symphony Quick Start - Deploying a Redis server to a Kubernetes cluster](https://github.com/Azure/symphony-docs/blob/main/symphony-book/quick_start/deploy_redis_k8s.md)
