# Tutorial: How to Create and Manage Deployments with Azure Arc enabled Kubernetes with GitOps 

GitOps allows you to deploy your application based on a Git repository, which acts as a “source of truth” allowing changes to be tracked. If your Kubernetes cluster is Arc-enabled or you have deployed an Azure Kubernetes cluster (AKS), then you can use Azure enabled GitOps. 

To create your deployments, begin by declaring the desired state of your AI Application and Assets (Skill, Solution, and Solution Instance)--projected and managed as Kubernetes objects-- in files in Git repositories. GitOps communicates with a Flux Operator on your Arc-enabled or AKS cluster and picks up on any changes made to your repo. Flux is an open-source tool used by GitOps on Azure Arc-enabled Kubernetes and AKS to continuously update your cluster configurations to make sure they remain in your desired state. Flux pulls the files from the repositories and applies the required state to your clusters. 

## Prerequisites 

Before proceeding, we recommend completing the setup tutorial to successfully set up your SYMPHONY experience onto your Kubernetes environment. See the following resources: 

* [SYMPHONY: Setup guide](https://github.com/Azure/SYMPHONY/blob/SYMPHONY/docs/tutorial/setup-guide.md) to set up your portal experience 
* [Quickstart: Connect an existing Kubernetes cluster to Azure Arc - Azure Arc](https://learn.microsoft.com/en-us/azure/azure-arc/kubernetes/quickstart-connect-cluster?tabs=azure-cli%2Cazure-cloud) for guidance on how to Arc-enable your cluster 
* [Azure Kubernetes Service (AKS)](https://learn.microsoft.com/en-us/azure/aks/) documentation for more information on AKS 

## Step 1: Create a GitHub environment for your configuration files 

Create YAML definition files for your AI Skill(s), Solution(s), and Solution Instance(s). To see SYMPHONY object models, visit: [SYMPHONY/docs/api at main · Azure/SYMPHONY](https://github.com/Azure/SYMPHONY/tree/main/docs/api). 


Here are samples of definition files.  


Sample #1 
```azurecli-interactive
apiVersion: ai.symphony/v1 

kind: Skill 

metadata: 

  name: <Skill name> 

  namespace: default 

spec: 

  displayName: Orin People Skill 

  edges: 

  - source: 

      node: '0' 

      route: f 

    target: 

      node: '1' 

      route: f 

  - source: 

      node: '1' 

      route: f 

    target: 

      node: '3' 

      route: f 

  - source: 

      node: '3' 

      route: f 

    target: 

      node: '5' 

      route: f 

  nodes: 

  - configurations: 

      device_name: $param(device_id) 

      fps: $param(fps) 

      ip: $param(rtsp) 

    id: '0' 

    name: rtsp 

    type: source 

  - configurations: 

      confidence_lower: '30' 

      confidence_upper: '50' 

      max_images: '20' 

    id: '1' 

    name: model 

    type: model 

  - configurations: 

      confidence_threshold: '60' 

      labels: '["person"]' 

    id: '3' 

    name: filter_transform 

    type: transform 

  - configurations: 

      delay_buffer: '20' 

    id: '5' 

    name: iothub_export 

    type: export 

  parameters: 

    accelerationRetrieve: Nvidia Jetson (Jetpack 5) 

    device_displayname: invalid 

    device_id: invalid 

    fps: invalid 

    fpsRetrieve: '15' 

    instance_displayname: invalid 

    rtsp: invalid 

    skill_displayname: invalid 
```
 

Sample #2 

```azurecli-interactive

apiVersion: solution.symphony/v1 

kind: Solution 

metadata: 

  name: <Solution name> 

  namespace: default 

spec: 

  components: 

  - name: voeedge 

    properties: 

      container.createOptions: '{"HostConfig":{"LogConfig":{"Type":"json-file","Config":{"max-size":"10m","max-file":"10"}},"runtime":"nvidia"}}' 

      container.image: <container image url> 

      container.restartPolicy: always 

      container.type: docker 

      container.version: 0.38.1-dev.1 

      env.AISKILLS: ‘[“<AI Skill name>”]' 

      env.BLOB_STORAGE_CONNECTION_STRING: <Connection String>                   

      env.BLOB_STORAGE_CONTAINER:<Storage name> 

      env.INSTANCE: $instance() 

      env.IOTEDGE_CONNECTION_STRING:<Connection String> 

      env.SYMPHONY_AGENT_ADDRESS: target-runtime-symphony-agent 

      env.WEBMODULE_URL: <url> 

  displayName: <display name> 
```

Sample #3  

 
```azurecli-interactive
apiVersion: solution.symphony/v1 

kind: Instance 

metadata: 

  finalizers: 

  - instance.solution.symphony/finalizer 

  name: <Instance name> 

  namespace: default 

spec: 

  displayName: Orin People Deployment 

  parameters: 

    configure_data: '{"People Camera": ["Orin People Skill"]}' 

    <skill>.device_displayname: People Camera 

    <skill>.device_id: device-e60681e4-6511-4090-87a2-8c6b147907f4 

    <skill>.fps: "15" 

    <skill>.instance_displayname: Orin 

    <skill>.rtsp: rtsp://<your camera's rtsp url with user/pass attached>  

    <skill>.skill_displayname: Orin People Skill 

  scope: poss 

  solution: <Solution name> 

  target: 

    name: <Target name> 

```

 
Add, commit, and then push these files to your repository.  

## Step 2: Enable GitOps with Flux v2 in your cluster & map your GitHub environment to your cluster 

To enable GitOps within your cluster and map your GitHub environment to your cluster, visit: [Tutorial: Use GitOps with Flux v2 in Azure Arc-enabled Kubernetes or Azure Kubernetes Service (AKS) clusters](https://learn.microsoft.com/en-us/azure/azure-arc/kubernetes/tutorial-use-gitops-flux2?source=recommendations). 

## Step 3: View your objects 

After creating and pushing your YAML files to your Git repository, view your current object configurations running in your environment:  

```azurecli-interactive
kubectl get skill <skill name> -o yaml 
```
```azurecli-interactive
kubectl get instance <instance name> -o yaml 
```
```azurecli-interactive
kubectl get solution <solution name> -o yaml 
```
 

## Updating YAML files 

To update your YAML files, make your edits directly in your Git environment. Then add, commit, and push your changes to your repository. You can view the changes in your repo. Flux will automatically reconcile any changes to your cluster state. 

Use the kubectl commands from __Step 3: View your objects__ to view the changes in your object definitions. It may take some time to see the changes as it takes Flux a few minutes to update the configuration. 

## Next Steps
 
Now that you learned more about how to interact with SYMPHONY API through Gitops, we recommend reviewing the following documents:

- [SYMPHONY: API overview](/docs/api/README.md)
- [How-to guide: Bring your own ML model and processing logic for your AI Skill using gRPC Custom Processing (BYOM)](/docs/tutorial/How-to-BYOM.md)
