# Symphony Quick Start: Deploying a Redis server to a Kubernetes cluster

Ready to jump into actions right away? This quick start walks you through the steps of setting up a new Symphony control plane on your Kubernetes cluster and deploying a new Symphony solution instance to the cluster.

> **NOTE**: The following steps are tested under a Ubuntu 20.04.4 TLS WSL system on Windows 11. However, they should work for Linux, Windows, and MacOS systems as well.

![IoT Edge](../images/redis-k8s.png)

## 0. Prerequisites

* [Helm 3](https://helm.sh/) - Required to deploy Symphony.
* [kubectl](https://kubernetes.io/docs/reference/kubectl/kubectl/): Configured with the Kubernetes cluster you want to use as the default context. Note that if you use cloud shell, kubectl is already configured.
* [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/)

## 1. Deploy Symphony using Helm

The easiest way to install Symphony is to use Helm:

  ```bash
  helm install symphony oci://possprod.azurecr.io/helm/symphony --version 0.40.58
  ```

Or, if you already have the ```symphony-k8s``` repository cloned, use:

  ```bash
  cd symphony-k8s/helm
    helm install symphony ./symphony
```

## 2. Register the current cluster as a Symphony Target

To create a new YAML file that describes a Symphony Target, use the following to submit the file:

  ```kubectl create -f <filename>```

Use the following to apply any changes:

  ```kubectl apply -f <filename> ```

> **NOTE**: You can get a sample of this file under ```symphony-docs/samples/k8s/hello-world/target.yaml```:

```yaml
apiVersion: fabric.symphony/v1
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

> **NOTE**: The above sample doesn't deploy a **Symphony Agent**, which is optional. 

## 3. Create the Symphony Solution

The following YAMl file describes a Symphony Solution with a single Redis server component. Use the following to submit the file:

  ```kubectl create -f <filename>```

Use the following to apply any changes:

  ```kubectl apply -f <filename> ```

```yaml
apiVersion: solution.symphony/v1
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

## 4. Create the Symphony Solution Instance

A Symphony Solution Instance maps a Symphony Solution to one or multiple Targets. Use the following to submit the file:

  ```kubectl create -f <filename>```

Use the following to apply any changes:

  ```kubectl apply -f <filename> ```

The following artifacts maps the ```redis-server``` soltuion to the ```k8s-target``` target above:

```yaml
apiVersion: solution.symphony/v1
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

To examine all the Symphony objects you've created, use:

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

## 6. Clean up Symphony objects

To delete all Symphony objects, use:

```bash
kubectl delete instance redis-instance
kubectl delete solution redis-server
kubectl delete target basic-k8s-target
kubectl delete ns basic-k8s #Symphony doesn't remove namespaces
```

## 7. To remove Symphony control plane (optional)

To remove Symphony control plane, use:

  ```bash
  helm delete symphony
  ```

# Next step

* [Symphony Quickstart: Deploying a simulated temperature sensor solution to an Azure IoT Edge device](/docs/api/quick_start/deploy_solution_to_azure_iot_edge.md)
