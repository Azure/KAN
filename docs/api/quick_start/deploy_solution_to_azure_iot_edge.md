# SYMPHONY API Quickstart: Deploying a simulated temperature sensor solution to an Azure IoT Edge device

Ready to jump into actions right away? This quickstart walks you through the steps of setting up a new SYMPHONY API control plane on your Kubernetes cluster and deploying a new SYMPHONY API solution instance to an Azure IoT Edge device.

> [!NOTE]
> The following steps are tested under a Ubuntu 20.04.4 TLS WSL system on Windows 11. However, they should work for Linux, Windows, and MacOS systems as well.

## 0. Prerequisites

* [Helm 3](https://helm.sh/) - Required to deploy SYMPHONY API.
* [kubectl](https://kubernetes.io/docs/reference/kubectl/kubectl/): Configured with the Kubernetes cluster you want to use as the default context. Note that if you use cloud shell, kubectl is already configured.
* [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/)

## 1. Deploy SYMPHONY API using Helm

The easiest way to install SYMPHONY API is to use Helm:
```bash
helm install symphony oci://kanprod.azurecr.io/helm/symphony --version 0.41.40
```

## 2. Create an IoT Edge device

These steps create a new resource group, a new IoT Hub, and a new IoT Edge device. You can also choose to use an existing IoT Edge device.

```bash
# install Azure IoT extension if needed
az extension add --name azure-iot

# create resource group
# sample: az group create --name s8c-demo --location westus2
az group create --name <resource group> --location <location>

# create IoT Hub
# sample: az iot hub create --name s8chub --resource-group s8c-demo --sku S1
az iot hub create --name <IoT Hub name> --resource-group <resource group> --sku <IoT Hub sku>

# create a IoT Edge device
# sample: az iot hub device-identity create --device-id s8c-vm --hub-name s8chub --edge-enabled
az iot hub device-identity create --device-id <device id> --hub-name <Iot Hub name> --edge-enabled

# get IoT Edge device connection string
# sample: az iot hub device-identity connection-string show --device-id s8c-vm --resource-group s8c-demo --hub-name s8chub
az iot hub device-identity connection-string show --device-id <device id> --resource-group <resource group> --hub-name <IoT Hub name>
```

## 3. Register a Linux VM as an IoT Edge device

You need to prepare a Linux VM or physical device for IoT Edge. In this guide, you'll create a new Linux VM:

```bash
# create vm
# sample: az vm create --resource-group s8c-demo --name s8c-vm --image UbuntuLTS --admin-username <user> --generate-ssh-keys --size Standard_D2s_v5
az vm create --resource-group <resource group> --name <vm name> --image <vm image> --admin-username <user> --generate-ssh-keys --size <vm size>

# SSH into the machine
ssh <user>@<vm public IP>

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

## 4. Register the IoT Edge device as a SYMPHONY API Target

Create a new YAML file that describes a SYMPHONY API Target. Use the following to submit the file:

```kubectl create -f <filename>```

Use the following to apply any changes:

```kubectl apply -f <filename> ```

```yaml
apiVersion: fabric.symphony/v1
kind: Target
metadata:
  name: voe-target
spec:
  forceRedeploy: true
  topologies:
  - bindings:
    - role: instance
      provider: providers.target.azure.iotedge
      config:
        name: "iot-edge"
        keyName: "iothubowner"
        key: "<Your IoT Hub Key>"
        iotHub: "<Yout IoT Hub Hostname>"
        apiVersion: "2020-05-31-preview"
        deviceName: "<Your device name>"
```

## 5. Create the SYMPHONY API Solution

The following YAMl file describes a SYMPHONY API Solution with a single component, which is based on the ```mcr.microsoft.com/azureiotedge-simulated-temperature-sensor:1.0``` container. Use the following to submit the file:

```kubectl create -f <filename>```

Use the following to apply any changes:

```kubectl apply -f <filename> ```

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

## 6. Create the SYMPHONY API Solution Instance

A SYMPHONY API Solution Instance maps a SYMPHONY API Solution to one or multiple Targets. The following artifacts maps the ```simulated-temperature-sensor``` solution to the ```voe``` target above. Use the following to submit the file:

```kubectl create -f <filename>```

Use the following to apply any changes:

```kubectl apply -f <filename> ```

```yaml
apiVersion: solution.symphony/v1
kind: Instance
metadata:
  name: my-instance-2
spec:
  solution: simulated-temperature-sensor
  target:
    name: voe-target
```

## 7. Verification

To examine all the SYMPHONY API objects you've created:

```bash
kubectl get targets
kubectl get solutions
kubectl get instances
```

On the IoT Hub page, verify all IoT Edge modules are up and running.

## 8. Clean up SYMPHONY API objects

To delete all SYMPHONY API objects:

```bash
kubectl delete instance my-instance-2
kubectl delete solution simulated-temperature-sensor
kubectl delete target voe-target
```
## 9. Remove the SYMPHONY API control plane (optional)

To remove the SYMPHONY API control plane:

```bash
helm delete symphony
```


# Next step

* [SYMPHONY API Quick Start - Deploying a Redis server to a Kubernetes cluster](./deploy_redis_k8s.md)