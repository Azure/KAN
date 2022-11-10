// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from 'react';
import { Stack, Label, Text, IColumn, DetailsList, CheckboxVisibility } from '@fluentui/react';
import { useDispatch } from 'react-redux';

import { getDeploymentVideoRecordings } from '../../../store/deploymentSlice';
import { VideoRecroding } from '../../../store/types';
import { theme } from '../../../constant';

interface Props {
  deploymentName: string;
  skillName: string;
  cameraName: string;
}

const VidoeRecroding = (props: Props) => {
  const { deploymentName, skillName, cameraName } = props;

  const dispatch = useDispatch();

  const [localVideoRecording, setLocalVideoRecording] = useState<VideoRecroding[] | null>(null);
  const [selectedRecordingUrl, setSelectedRecordingUrl] = useState<string>('');

  useEffect(() => {
    if (localVideoRecording) return;

    (async () => {
      const respose: any = await dispatch(
        getDeploymentVideoRecordings({ deploymentName, skillName, cameraName }),
      );

      setLocalVideoRecording(respose.payload);
    })();
  }, [dispatch, deploymentName, skillName, cameraName, localVideoRecording]);

  const columns: IColumn[] = [
    {
      key: 'name',
      name: 'Name',
      fieldName: 'filename',
      minWidth: 270,
      onRender: (item: VideoRecroding) => (
        <Text
          styles={{ root: { color: theme.palette.themeSecondary, fontSize: '12px' } }}
          onClick={() => setSelectedRecordingUrl(item.url)}
        >
          {item.filename}
        </Text>
      ),
    },
    {
      key: 'createdTime',
      name: 'Time Added',
      fieldName: 'creation_time',
      minWidth: 250,
      maxWidth: 250,
    },
  ];

  return (
    <Stack styles={{ root: { padding: '25px 20px 0' } }}>
      {!!localVideoRecording && (
        <Stack horizontal tokens={{ childrenGap: 20 }}>
          <Stack styles={{ root: { width: '50%' } }} tokens={{ childrenGap: 10 }}>
            <Text>Last 20 recordings in storage</Text>
            <Stack>
              <DetailsList
                styles={{ root: { height: '360px', width: '400px' } }}
                items={localVideoRecording}
                columns={columns}
                checkboxVisibility={CheckboxVisibility.hidden}
              />
            </Stack>
          </Stack>
          <Stack>
            {selectedRecordingUrl && (
              <video
                style={{ width: '100%' }}
                src={selectedRecordingUrl}
                controls={true}
                controlsList="nodownload noremoteplayback"
                disablePictureInPicture
                autoPlay={true}
              />
            )}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};

export default VidoeRecroding;
