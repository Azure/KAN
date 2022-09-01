// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack, Icon, Text, mergeStyleSets, Label } from '@fluentui/react';
import { useSelector } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { Camera } from '../../../store/cameraSlice';
import { selectLocationById } from '../../../store/locationSlice';
import { ConntectedStatus } from '../../../store/types';
import { theme } from '../../../constant';

import { RTSPVideo } from '../../RTSPVideo';

interface Props {
  camera: Camera;
  status: ConntectedStatus;
  fps: string;
  acceleration: string;
}

const getClasses = () =>
  mergeStyleSets({
    root: { padding: '25px 20px 0' },
    cameraWrapper: { width: '470px', height: '270px' },
    infoWrapper: { backgroundColor: '#CCCCCC', marginTop: '40px', padding: '11px', width: '400px' },
    infoHeader: { fontSize: '14px', lineHeight: '20px', marginTop: '40px' },
    inftoTitle: { width: '90px', color: theme.palette.neutralSecondary },
    info: { fontWeight: 700, color: theme.palette.neutralSecondary },
    connectedStatus: { color: '#57A300' },
    unconnectedStatus: { color: '#A4262C' },
  });

const GeneralCamera = (props: Props) => {
  const { camera, status, fps, acceleration } = props;

  const location = useSelector((state: RootState) => selectLocationById(state, camera.location));
  const classes = getClasses();

  return (
    <Stack styles={{ root: classes.root }} tokens={{ childrenGap: 10 }}>
      <Stack styles={{ root: classes.cameraWrapper }}>
        <RTSPVideo cameraId={camera.id} />
      </Stack>
      <Stack tokens={{ childrenGap: 20 }}>
        <Label styles={{ root: classes.infoHeader }}>Deployment AI Skill Reported Status</Label>
        <Stack tokens={{ childrenGap: 10 }} styles={{ root: classes.infoWrapper }}>
          <Stack tokens={{ childrenGap: 5 }} horizontal>
            <Icon
              iconName={status === 'connected' ? 'SkypeCircleCheck' : 'DRM'}
              styles={{ root: status === 'connected' ? classes.connectedStatus : classes.unconnectedStatus }}
            />
            <Text>{status === 'connected' ? 'Configured' : 'Camera Inactive'}</Text>
          </Stack>
          <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 5 }}>
            <Text styles={{ root: classes.inftoTitle }}>Frame rate</Text>
            <Text>:</Text>
            <Text styles={{ root: classes.info }}>{fps} fps</Text>
          </Stack>
          <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 5 }}>
            <Text styles={{ root: classes.inftoTitle }}>Location</Text>
            <Text>:</Text>
            <Text styles={{ root: classes.info }}>{location.name}</Text>
          </Stack>
          <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 5 }}>
            <Text styles={{ root: classes.inftoTitle }}>Acceleration</Text>
            <Text>:</Text>
            <Text styles={{ root: classes.info }}>{acceleration}</Text>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default GeneralCamera;
