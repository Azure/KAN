import React from 'react';
import { Stack, Label, Checkbox, ActionButton } from '@fluentui/react';
import { useSelector } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { selectLocationById } from '../../../store/locationSlice';
import { Camera } from '../../../store/cameraSlice';
import { theme } from '../../../constant';

import MenuButton from './MenuButton';

interface Props {
  camera: Camera;
  onCameraCardSelect: (checked: boolean, cameraId: number) => void;
  onLiveFeedRedirect: (id: number) => void;
}

const CameraCard = (props: Props) => {
  const { camera, onCameraCardSelect, onLiveFeedRedirect } = props;

  const localLocation = useSelector((state: RootState) => selectLocationById(state, camera.location));

  return (
    <Stack
      styles={{
        root: {
          width: '300px',
          height: '220px',
          outline: '0.3px solid rgba(0,0,0,0.1)',
          borderRadius: '4px',
        },
      }}
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
        <MenuButton camera={camera} iconName="MoreVertical" />
      </Stack>
      <Stack
        styles={{ root: { position: 'relative', height: '100%', padding: '14px 24px 35px' } }}
        horizontal
        horizontalAlign="space-between"
      >
        <Stack>
          <Label
            styles={{ root: { color: theme.palette.neutralSecondaryAlt, fontSize: '13px', fontWeight: 400 } }}
          >
            Location
          </Label>
          <Label styles={{ root: { fontSize: '13px', fontWeight: 400 } }}>{localLocation.name}</Label>
        </Stack>
        <Stack verticalAlign="end">
          <Stack tokens={{ childrenGap: 10 }} horizontal verticalAlign="center">
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
              view playback
            </ActionButton>
          </Stack>
        </Stack>
        <Checkbox
          styles={{ root: { position: 'absolute', right: '10px', bottom: '10px' } }}
          onChange={(_, checked) => onCameraCardSelect(checked, camera.id)}
        />
      </Stack>
    </Stack>
  );
};

export default CameraCard;
