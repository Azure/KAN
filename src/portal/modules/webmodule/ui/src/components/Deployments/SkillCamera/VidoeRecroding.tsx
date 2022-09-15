// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from 'react';
import { Stack, Label, Text, IColumn, DetailsList, CheckboxVisibility } from '@fluentui/react';
import { useDispatch } from 'react-redux';

import { getDeploymentVideoRecordings } from '../../../store/deploymentSlice';
import { VideoRecroding } from '../../../store/types';
import { theme } from '../../../constant';

interface Props {
  deployment: number;
  skillName: string;
  cameraName: string;
}

const VidoeRecroding = (props: Props) => {
  const { deployment, skillName, cameraName } = props;

  const dispatch = useDispatch();

  const [localVideoRecording, setLocalVideoRecording] = useState<VideoRecroding[] | null>(null);
  const [selectedRecordingUrl, setSelectedRecordingUrl] = useState<string>('');

  useEffect(() => {
    if (localVideoRecording) return;

    (async () => {
      const respose: any = await dispatch(
        getDeploymentVideoRecordings({ deployment, skillName, cameraName }),
      );

      setLocalVideoRecording(respose.payload);
    })();
  }, [dispatch, deployment, skillName, cameraName, localVideoRecording]);

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
            <Stack tokens={{ childrenGap: 40 }}>
              <DetailsList
                styles={{ root: { height: '360px', width: '400px' } }}
                items={localVideoRecording}
                columns={columns}
                checkboxVisibility={CheckboxVisibility.hidden}
              />
              <Stack>
                <Label>Embed Recordings Widget</Label>
                <Text>You can embed to above widget for your own application.</Text>
              </Stack>
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
