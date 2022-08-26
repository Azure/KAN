# POSS API
POSS API defines a common object model that describes the full stack of intelligent solutions, from AI models to solutions to devices and sensors. Because these objects are defined as standard Kubernetes [custom resources](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/), you can use popular Kubernetes tools like [kubectl](https://kubernetes.io/docs/reference/kubectl/kubectl/) to manipulate these objects.

POSS API is based on another OSS project – [Symphony](https://github.com/azure/symphony-k8s).

## POSS Object Model

* [AI Model](./object-model/ai-model.md) (```model.ai.symphony```)
* [AI Skill](./object-model/ai-skill.md) (```skill.ai.symphony```)
* [Device](./object-model/device.md) (```device.fabric.symphony```)
* [Target](./object-model/target.md) (```target.fabric.symphony```)
* [Solution](./object-model/solution.md) (```solution.solution.symphony```)
* [Instance](./object-model/instance.md) (```instance.solution.symphony```)

## Mapping between POSS Object Model and POSS Portal Concepts

POSS Portal experience aims to provide a streamlined experience of creating and managing intelligent solutions leveraging cameras. Hence, we’ve hidden some POSS API concepts and renamed a few objects to make the UX more intuitive for target scenarios. The following table summarizes how portal concepts are mapped to API concepts:

| API Object | Portal Concept |
|--------|--------|
| ```device.fabric.symphony``` | Camera |
| ```instance.solution.symphony``` | Deployment |
| ```model.ai.symphony``` | AI Model |
| ```skill.ai.symphony``` | AI Skill |
| ```solution.solution.symphony``` | There’s no Solutions surfaced on portal. Essentially, a portal operates on a single, system-maintained Solution object on behalf of the user. |
| ```target.fabric.symphony``` | Compute Device | 

## Typical Workflows

Depending on your focus, you may start with the AI workflow, the device workflow, or the solution workflow as described below. At the end, you want to create ```Instance``` objects which represent running deployments of your intelligent edge solution.

### AI workflow
1. Create your AI model using tools of your choice. 
2. Once you have the AI model file, you can register your AI model with POSS as a ```Model``` object. 
3. You can then define AI ```Skill``` objects that define processing pipelines. A processing pipeline reads data from a data source, applies one or more AI models (and other transformations), and sends inference results to designated outputs.

### Device workflow
1. Register your computational devices with POSS as ```Target``` objects. You can also specify desired runtime components, such as POSS agent, in your target definition.
2. Manually register your non-computational devices, such as sensors and actuators, as ```Device``` objects. You can also leverage projects like [Akri](https://github.com/project-akri/akri) to auto-discover devices.

### Solution workflow
1. Define your intelligent solution as a ```Solution``` object, which consists of a number of ```Component``` elements. A component is usually a container, and it may refer to AI ```Skill``` objects in its properties.
2. Define a ```Instance``` object that maps a ```Solution``` to one or multiple ```Target``` objects. Once the instance object is created, POSS ensures the impacted targets are updated according to the desired solution state and target state.

> **NOTE:** The current version of POSS Portal doesn't explicitly expose the ```Solution``` object. Behind the scenes, you always work with a single ```Solution``` object that is automatically managed. You can use POSS API to examine and update the object, though.

## A Sample Workflow
Assume that you are creating an intelligent edge solution that uses a website to show number of cars passing an intersection each hour. The following workflow describes how to create and deploy such as solution using POSS API.

1. Create or select a car detection model. POSS comes with a model zoo, which contains a car detection model you can use.
2. Register the model as a POSS ```Model``` object.
3. Define a POSS ```Skill``` object that defines a pipeline:
    * takes input from a camera;
    * sends frames to the car detection model;
    * collect inference result and send detection event to an output (such as IoT Hub or an HTTP endpoint).
4. Define a POSS ```Solution``` object that will a Docker container ```Component``` that takes the ```Skill``` as input and drives the inference process. Since POSS provides a couple of such containers out-of-box, you don't need to create these containers yousrelf.
5. Create your website container and add it as a ```Component``` of your ```Solution```.
5. Define a ```Target``` that represents a computer to which you want to deploy your solution.
6. Define ```Device``` objects for cameras you want to use. These ```Device``` objects are associated with your ```Target``` object through labeling.
7. Create a ```Instance``` object that deploys your ```Solution``` to your ```Target```.

## Getting Started
Please check out our [quick start page](./quick_start/quick_start.md) to try out the tutorials.

## Additional POSS Topics
* [Symphony docs](https://github.com/azure/symphony-k8s/docs)
* POSS Configuration
* Secret Management
* Security
* Observability