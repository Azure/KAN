# Instance
```instance.solution.symphony``` maps a [```solution.solution.symphony```](./solution.md) object to one or more [```target.fabric.symphony```](./target.md) objects. Creating an instance object triggers deployments to targets.

## Schema
| Field | Type | Description |
|--------|--------|--------|
| ```DisplayName``` | ```string``` | A user friendly name |
| ```Parameters``` | ```map[string]string``` | Parameters. A parameter can be used anywhere in the skill definition. See the [parameters](#parameters) sections below |
| ```Pipeline``` | ```[]PipelineSpec``` | AI pipeline configurations. |
| ```Solution``` | ```string``` | Name of the [Solution](./solution.md) to de deployed.|
| ```Target``` | ```TargetRefSpec``` | Name of the [Target](./target.md), or a selector of targets to deploy to multiple targets.|
