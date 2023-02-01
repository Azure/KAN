# Targets

```targets.fabric.kan``` represents an endpoint to which a payload (solution [Instance](./instance.md)) can be deployed. An Target can be a physical device, a server, a cluster of servers, a Kubernetes cluster, or any endpoint that is represented by a target provider.

## Schema
| Field | Type | Description |
|--------|--------|--------|
| ```Components```| ```[]ComponentSpec``` | A list of components that comprise the software, policy and configuration stack on the target.| 
| ```Constraints``` | ```[]ConstraintSpec``` | A list of constraints on where the Target can be used. |
| ```DisplayName``` | ```string``` | A user-friendly name. |
| ```ForceRedeploy``` | ```bool``` | If a Target should be redeployed on any artifact changes. |
| ```Metadata``` | ```map[string]string``` | Custom metadata associated with the target. |
| ```Properties``` | ```map[string]string``` | Target properties. |
| ```Topologies``` | ```[]TopologySpec``` | Target [bindings](./binding.md) as well as [device](./device.md) topologies. |
