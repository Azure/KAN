# AI skills

```skill.ai.kan``` defines a processing graph that is comprised of ```edges``` and ```nodes```. 

## Schema
| Field | Type | Description |
|--------|--------|--------|
| ```Bindings```| ```[]BindingSpec``` | A list of [bindings](binding.md) that represent actions allowed on the AI skill. | 
| ```DisplayName``` | ```string``` | A user friendly name. |
| ```Edges``` | ```[]EdgeSpec``` | Graph edges. |
| ```Nodes``` | ```[]NodeSpec``` | Graph nodes. |
| ```Parameters``` | ```map[string]string``` | Parameters. A parameter can be used anywhere in the skill definition. For more information, see the [parameters](#parameters) sections below. |
| ```Properties``` | ```map[string]string``` | A property bag, |

## Parameters
You can define any number of parameters in the ```parameters``` section. All parameters are ```string``` typed. And you specify a default for the parameter when declaring it.
```yaml
parameters:   
  delay_buffer: "0.1"
  model_platform: "invalid"
  model_flavor: "edge"
```
Then, you can refer to the parameter in your AI skill graph definition, for example:
```yaml
nodes:
- id: "4"
  type: export
  name: video_snippet_export
  configurations:
    filename_prefix: test
    recording_duration: "$param(model_flavor)"
    insights_overlay: "$param(model_platform)"
    delay_buffer: "$param(delay_buffer)"  
```
## Overwrite parameters
A ```instance.solution.kan``` object can overwrite AI skill parameter values in its own ```parameters``` section.

```yaml
parameters:
  cv-skill.delay_buffer: "0.2"
  cv-skill.model_platform: "TensorFlow"
  cv-skill.model_flavor: "TensorFlowMobile"
```
>**Note:** when a solution instance uses multiple references to a same AI skill, it can use alias to distinguish different AI skill instances. 
