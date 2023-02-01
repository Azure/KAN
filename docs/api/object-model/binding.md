# Binding

A binding binds a ```role``` to a ```provider```. 

In KAN API, a role represents a set of actions that can be taken on an entity. For example, an **instance role** represents a set of operations that can be performed on an ```instance.solution.kan``` object, such as **Apply()**, **Get()** and **Remove()**. A binding binds a role to a provider, which implements the required interface. 

## Schema
| Field | Type | Description | 
|--------|--------|--------|
| ```Config``` | ```map[string]string``` | Provider configuration. |
| ```Provider``` | ```string``` | The name of the provider that implements the interface required by the role. |
| ```Role```| ```string``` | A string identifier of a predefined role. In the current version, we have only one ```instance``` role defined for managing ```instances``` on a ```target```. | 

## Example
In a ```target``` definition, you can use an ```instance``` role to map all instance operations - **Apply()**, **Get()** and **Remove()** - to a ```providers.target.azure.iotedge``` provider that handles Azure IoT Edge devices. You supply IoT Edge connection info in the provider ```config```.

```yaml
topologies:
  - bindings:
    - role: instance
      provider: providers.target.azure.iotedge
      config:
        name: "<Config name>"
        keyName: "<Iot Hub Key Name>"
        key: "<IoT Hub Key>"
        iotHub: "<Iot Hub name>"
        apiVersion: "2020-05-31-preview"
        deviceName: "s8c-vm"
```
