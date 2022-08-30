// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack, Label, ActionButton, Text } from '@fluentui/react';
import { useSelector } from 'react-redux';
import { isEmpty } from 'ramda';

import { State as RootState } from 'RootStateType';
import { selectLocationById } from '../../../store/locationSlice';
import { Camera } from '../../../store/cameraSlice';
import { theme } from '../../../constant';
import { cardBorderStyle } from '../../constant';
import { getLimitText } from '../../utils';

import MenuButton from '../../Common/MenuButton';

interface Props {
  camera: Camera;
  onCameraCardSelect: (checked: boolean, cameraId: number) => void;
  onLiveFeedRedirect: (id: number) => void;
  onCameraSelected: (camera: Camera) => void;
  onDeleteModalOpen: (camera: Camera) => void;
}

const CameraCard = (props: Props) => {
  const { camera, onLiveFeedRedirect, onCameraSelected, onDeleteModalOpen } = props;

  const localLocation = useSelector((state: RootState) => selectLocationById(state, camera.location));

  if (!localLocation) return <></>;

  return (
    <Stack
      styles={{
        root: {
          width: '300px',
          height: '220px',
          ...cardBorderStyle,
        },
      }}
      onClick={() => onCameraSelected(camera)}
    >
      <Stack
        horizontal
        horizontalAlign="space-between"
        verticalAlign="center"
        styles={{ root: { outline: '0.3px solid rgba(0,0,0,0.1)' } }}
      >
        <Stack horizontal tokens={{ childrenGap: 10 }}>
          <Stack styles={{ root: { width: '60px', height: '60px' } }}>
            <img
              src={
                camera.media_type === 'Camera'
                  ? '/icons/camera/cameraCard.png'
                  : '/icons/camera/videoCard.png'
              }
              alt="camera"
            />
          </Stack>
          <Stack>
            <Label>{camera.name}</Label>
            <Label styles={{ root: { color: theme.palette.neutralSecondaryAlt, fontSize: '12px' } }}>
              {camera.media_type}
            </Label>
          </Stack>
        </Stack>
        <Stack>
          <MenuButton
            iconName="MoreVertical"
            onTargetSelected={() => onCameraSelected(camera)}
            onDeleteModalOpen={() => onDeleteModalOpen(camera)}
          />
        </Stack>
      </Stack>
      <Stack
        styles={{ root: { position: 'relative', height: '100%', padding: '14px 24px 35px' } }}
        horizontal
        horizontalAlign="space-between"
      >
        <Stack>
          <Label
            styles={{
              root: { color: theme.palette.neutralSecondaryAlt, fontSize: '13px', fontWeight: 400 },
            }}
          >
            Location
          </Label>
          <Text styles={{ root: { fontSize: '13px', fontWeight: 400 } }}>
            {getLimitText(localLocation.name, 33)}
          </Text>
        </Stack>
        <Stack verticalAlign="end">
          {isEmpty(camera.snapshot) ? (
            <Stack
              styles={{ root: { width: '135px', height: '80px', backgroundColor: '#000', color: '#FFF' } }}
              verticalAlign="center"
              horizontalAlign="center"
            >
              processing
            </Stack>
          ) : (
            <img style={{ width: '135px', height: '80px' }} src={camera.snapshot} alt="" />
          )}

          <Stack tokens={{ childrenGap: 10 }} horizontal verticalAlign="center" horizontalAlign="end">
            <ActionButton
              styles={{
                root: { fontSize: '12px', color: theme.palette.themeSecondary },
                textContainer: { textDecoration: 'underline' },
              }}
              iconProps={{
                iconName: 'NavigateBackMirrored',
              }}
              onClick={() => onLiveFeedRedirect(camera.id)}
            >
              view
            </ActionButton>
          </Stack>
        </Stack>
        {/* <Checkbox
          styles={{ root: { position: 'absolute', right: '10px', bottom: '10px' } }}
          onChange={(_, checked) => onCameraCardSelect(checked, camera.id)}
        /> */}
      </Stack>
    </Stack>
  );
};

export default CameraCard;