// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack, Label, ActionButton, Text } from '@fluentui/react';
import { isEmpty } from 'ramda';
import { useSelector } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { Camera } from '../../../store/cameraSlice';
import { theme } from '../../../constant';
import { cardBorderStyle } from '../../constant';
import { getLimitText } from '../../utils';

import MenuButton from '../../Common/MenuButton';

interface Props {
  camera: Camera;
  onCameraCardSelect: (checked: boolean, cameraId: number) => void;
  onLiveFeedRedirect: (id: number) => void;
  onCameraSelected: () => void;
  onDeleteModalOpen: () => void;
  onDefinitionOpen: () => void;
}

const CameraCard = (props: Props) => {
  const { camera, onLiveFeedRedirect, onCameraSelected, onDeleteModalOpen, onDefinitionOpen } = props;

  const { storage_account, storage_container, subscription_id } = useSelector(
    (state: RootState) => state.setting,
  );
  const isNoAzureStorage = isEmpty(storage_account) && isEmpty(storage_container) && isEmpty(subscription_id);

  return (
    <>
      <Stack
        styles={{
          root: {
            width: '300px',
            height: '220px',
            ...cardBorderStyle,
          },
        }}
        onClick={onCameraSelected}
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
              onTargetSelected={onCameraSelected}
              onDeleteModalOpen={onDeleteModalOpen}
              onDefinitionOpen={onDefinitionOpen}
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
              {getLimitText(camera.location, 33)}
            </Text>
          </Stack>
          <Stack verticalAlign="end">
            {isNoAzureStorage && (
              <Stack
                styles={{
                  root: {
                    width: '135px',
                    height: '80px',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    fontSize: '12px',
                    justifyContent: 'center',
                    textAlign: 'center',
                    whiteSpace: 'pre-line',
                  },
                }}
              >
                Not Available {'\n'} No Storage Account
              </Stack>
            )}
            {/* {isEmpty(camera.snapshot) && !isNoAzureStorage ? (
              <Stack
                styles={{ root: { width: '135px', height: '80px', backgroundColor: '#000', color: '#FFF' } }}
                verticalAlign="center"
                horizontalAlign="center"
              >
                processing
              </Stack>
            ) : (
              <img style={{ width: '135px', height: '80px' }} src={camera.snapshot} alt="" />
            )} */}

            <Stack tokens={{ childrenGap: 10 }} horizontal verticalAlign="center" horizontalAlign="end">
              <ActionButton
                styles={{
                  root: { fontSize: '12px', color: theme.palette.themeSecondary },
                  textContainer: { textDecoration: 'underline' },
                }}
                iconProps={{
                  iconName: 'NavigateBackMirrored',
                }}
                onClick={(e) => {
                  onLiveFeedRedirect(camera.id);
                }}
              >
                view
              </ActionButton>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </>
  );
};

export default CameraCard;
