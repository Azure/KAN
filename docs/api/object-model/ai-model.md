# AI Models

```model.ai.symphony``` represents an AI model. It has a simple and open schema to accomodate AI model descriptions from different platforms and AI frameworks.

## Schema

| Field | Type | Description | 
|--------|--------|--------|
| ```Bindings```| ```[]BindingSpec``` | A list of [bindings](binding.md) that represent actions allowed on the AI model | 
| ```DisplayName``` | ```string``` | A user friendly name |
| ```Constraints``` | ```[]ConstraintSpec``` | A list of constraints on where the AI model can be applied|
| ```Properties``` | ```map[string]string``` | A property bag |



