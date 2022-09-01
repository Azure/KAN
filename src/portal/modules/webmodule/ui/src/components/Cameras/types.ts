import { Camera } from '../../store/cameraSlice';

import { Tag } from '../Common/TagTab';

export type MediaType = 'Camera' | 'Video';
export type VideoType = 'upload' | 'link';
export type PivotTabKey = 'basics' | 'preview' | 'tag';

export type DeviceOption = { key: number; text: string; data: string };

export type CreateCameraFormData = {
  name: string;
  media_type: MediaType;
  videoType: VideoType;
  location: number;
  rtsp: string;
  media_source: string;
  tag_list: Tag[];
  selectedDeviceList: DeviceOption[];
  userName: string;
  password: string;
  error: {
    name: string;
    rtsp: string;
    mediaSource: string;
    selectedDeviceList: string;
    location: string;
  };
};

export type UpdateCameraFormData = {
  name: string;
  media_type: MediaType;
  videoType: VideoType;
  location: number;
  rtsp: string;
  media_source: string;
  selectedDeviceList: string[];
  userName: string;
  password: string;
  tag_list: Tag[];
};

export type ViewMode = 'card' | 'list';

export type FormmatedCamera = Camera & {
  locationName: string;
};
