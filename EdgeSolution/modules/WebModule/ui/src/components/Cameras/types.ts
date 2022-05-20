import { Tag } from '../Common/TagPage';

export type MediaType = 'Camera' | 'Video';
export type VideoType = 'upload' | 'link';
export type PivotTabKey = 'basics' | 'preview' | 'tag';

export type CreateCameraFormData = {
  name: string;
  media_type: MediaType;
  videoType: VideoType;
  location: number;
  rtsp: string;
  media_source: string;
  tagList: Tag[];
  selectedDeviceList: { key: number; text: string }[];
  userName: string;
  password: string;
  error: {
    name: string;
    rtsp: string;
    mediaSource: string;
    location: string;
  };
};

export type ViewMode = 'card' | 'list';
