# Devices

```device.fabric.symphony``` represents a non-computational device, such as a sensor (camera, microphone, vibration, pressure, etc.) or an actuator (motor, controller, I/O device, etc.).

## Schema
| Field | Type | Description |
|--------|--------|--------|
| ```Bindings```| ```[]BindingSpec``` | A list of [bindings](binding.md) that represent actions allowed on the AI skill. | 
| ```DisplayName``` | ```string``` | A user friendly name. |
| ```Properties``` | ```map[string]string``` | A property bag. |
