import React from 'react';
import { Stack } from '@fluentui/react';
import { useSelector } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { CreateCameraFormData } from '../types';
import { selectAllLocations } from '../../../store/locationSlice';

import PreviewTag from '../../Common/PreviewTag';
import PreviewLabel from '../../Common/PreviewLabel';

interface Props {
  localFormData: CreateCameraFormData;
  onTagRedirect: () => void;
}

const Preview = (props: Props) => {
  const { localFormData, onTagRedirect } = props;

  const locationList = useSelector((state: RootState) => selectAllLocations(state));

  return (
    <Stack styles={{ root: { paddingTop: '40px' } }} tokens={{ childrenGap: 15 }}>
      <PreviewLabel title="Name" content={localFormData.name} />
      <PreviewLabel title="Camera or Video" content={localFormData.media_type} />
      {localFormData.media_type === 'Camera' ? (
        <>
          <PreviewLabel
            title="Devices"
            content={localFormData.selectedDeviceList.length > 0 ? 'Yes' : 'No'}
          />
          <PreviewLabel title="RTSP URL" content={localFormData.rtsp} />
          <PreviewLabel title="Username" content={localFormData.userName} />
          <PreviewLabel title="Password" content={localFormData.password} />
        </>
      ) : (
        <PreviewLabel title="URL" content={localFormData.media_source} />
      )}
      <PreviewLabel
        title="Location"
        content={
          locationList.find((location) => location.id === localFormData.location)
            ? locationList.find((location) => location.id === localFormData.location).name
            : ''
        }
      />
      <PreviewTag tagList={localFormData.tagList} onTagRedirect={() => onTagRedirect()} />
    </Stack>
  );
};

export default Preview;
