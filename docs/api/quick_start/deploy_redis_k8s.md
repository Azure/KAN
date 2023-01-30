# KAN API Quick Start: Deploying a Redis server to a Kubernetes cluster

Ready to jump into actions right away? This quick start walks you through the steps of setting up a new KAN API control plane on your Kubernetes cluster and deploying a new KAN API solution instance to the cluster.

> **NOTE**: The following steps are tested under a Ubuntu 20.04.4 TLS WSL system on Windows 11. However, they should work for Linux, Windows, and MacOS systems as well.

## 0. Prerequisites

* [Helm 3](https://helm.sh/): Required to deploy KAN API.
* [kubectl](https://kubernetes.io/docs/reference/kubectl/kubectl/): Configured with the Kubernetes cluster you want to use as the default context. Note that if you use cloud shell, kubectl is already configured.
* [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/)

## 1. Deploy KAN API using Helm

The easiest way to install KAN API is to use Helm:

  ```bash
  helm install kan oci://kanprod.azurecr.io/helm/kan --version 0.41.40
  ```

## 2. Register the current cluster as a KAN API Target

To create a new YAML file that describes a KAN API Target, use the following to submit the file:

  ```kubectl create -f <filename>```

Use the following to apply any changes:

  ```kubectl apply -f <filename> ```


```yaml
apiVersion: fabric.kan/v1
kind: Target
metadata:
  name: basic-k8s-target
spec:  
  forceRedeploy: true
  topologies:
  - bindings:
    - role: instance
      provider: providers.target.k8s
      config:
        inCluster: "true"    
```

> **NOTE**: The above sample doesn't deploy a **KAN Agent**, which is optional. 

## 3. Create the KAN API Solution

The following YAMl file describes a KAN API Solution with a single Redis server component. Use the following to submit the file:

  ```kubectl create -f <filename>```

Use the following to apply any changes:

  ```kubectl apply -f <filename> ```

```yaml
apiVersion: solution.kan/v1
kind: Solution
metadata: 
  name: redis-server
spec:  
  metadata:
    deployment.replicas: "#1"
    service.ports: "JA.[{\"name\":\"port6379\",\"port\": 6379}]"
    service.type: "ClusterIP"
  components:
  - name: redis-server
    type: container
    properties:
      container.ports: "JA.[{\"containerPort\":6379,\"protocol\":\"TCP\"}]"
      container.imagePullPolicy: "Always"
      container.resources: "JO.{\"requests\":{\"cpu\":\"100m\",\"memory\":\"100Mi\"}}"        
      container.image: "docker.io/redis:6.0.5"
```

> [!NOTE]
> This solution uses the default deployment strategy, which is to deploy all component containers in the solution into a same pod. 

## 4. Create the KAN API Solution Instance

A KAN API Solution Instance maps a KAN API Solution to one or multiple Targets. Use the following to submit the file:

  ```kubectl create -f <filename>```

Use the following to apply any changes:

  ```kubectl apply -f <filename> ```

The following artifacts maps the ```redis-server``` soltuion to the ```k8s-target``` target above:

```yaml
apiVersion: solution.kan/v1
kind: Instance
metadata:
  name: redis-instance
spec:
  scope: basic-k8s
  solution: redis-server
  target: 
    name: basic-k8s-target    
```

## 5. Verification

To examine all the KAN API objects you've created, use:

```bash
kubectl get targets
kubectl get solutions
kubectl get instances
```

To observe the deployment status of the instance, use:

```bash
NAME             STATUS      TARGETS   DEPLOYED
redis-instance   OK          1         1
```

Use ```kubectl``` to examin pods and services:

```bash
kubectl get all -n basic-k8s
```
Notice that a ```redis-instance``` pod and a ```redis-instance``` service have been created. By default, the service is created as a ClusterIP service, which is accessible only by pods on the same cluster. You can change the service type by modifying the ```service.type``` metadata. 

## 6. Clean up KAN API objects

To delete all KAN API objects, use:

```bash
kubectl delete instance redis-instance
kubectl delete solution redis-server
kubectl delete target basic-k8s-target
kubectl delete ns basic-k8s #KAN API doesn't remove namespaces
```

## 7. To remove KAN API control plane (optional)

To remove KAN API control plane, use:

  ```bash
  helm delete kan
  ```

# Next step

* [KAN API Quickstart: Deploying a simulated temperature sensor solution to an Azure IoT Edge device](./deploy_solution_to_azure_iot_edge.md)