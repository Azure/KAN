// Slice Types
export type ComputeDevice = {
  id: number;
  name: string;
  iotHub: string;
  iotedge_device: string;
  architecture: string;
  acceleration: string;
  tag_list: { name: string; value: string }[];
};

// Payload Types
export type CreateCameraPayload = {
  location: number;
  name: string;
  rtsp?: string;
  media_source?: string;
  media_type: string;
};

export type CreateLocationPayload = { name: string };

export type UpdateCameraPayload = {
  id: number;
  body: {
    name: string;
    location: number;
  };
};

export type CreateComputeDevicePayload = {
  name: string;
  iothub: string;
  iotedge_device: string;
  architecture: string;
  acceleration: string;
  tag_list: string;
};
