import React, { useCallback, useState } from 'react';
import { CommandBar, ICommandBarItemProps, Stack, Text, PrimaryButton, Label } from '@fluentui/react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { Url } from '../../constant';
import { Camera, deleteCameras } from '../../store/cameraSlice';
import { ViewMode } from './types';

// import CameraCard from './CameraCard';
// import CameraCardList from './List/CameraCardList';
// import CameraList from './List/CameraList';
import CameraListManagement from './List/CameraListManagement';

interface Props {
  cameraList: Camera[];
}

const CamerasWrapper = (props: Props) => {
  const { cameraList } = props;

  const [selectedCameraList, setSelectedCameraList] = useState([]);
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  const history = useHistory();
  const dispatch = useDispatch();

  const onCameraCardSelect = useCallback((checked: boolean, cameraId: number) => {
    setSelectedCameraList((prev) => {
      if (checked) return [...prev, cameraId];
      return prev.filter((id) => cameraId !== id);
    });
  }, []);

  const onCameraListSelect = useCallback((cameraIds: number[]) => {
    setSelectedCameraList(cameraIds);
  }, []);

  const onCameraCreateRedirect = useCallback(() => {
    history.push(Url.CAMERAS2_CREATION_BASICS);
  }, [history]);

  const onDeleteCameraClick = useCallback(() => {
    dispatch(deleteCameras(selectedCameraList));
  }, [dispatch, selectedCameraList]);

  const onViewClick = useCallback(() => {
    setViewMode((prev) => (prev === 'card' ? 'list' : 'card'));
  }, []);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'add',
      text: 'Add Camera',
      iconProps: {
        iconName: 'Add',
      },
      onClick: onCameraCreateRedirect,
    },
    {
      key: 'refresh',
      text: 'Refresh',
      iconProps: {
        iconName: 'Refresh',
      },
      buttonStyles: {
        root: { borderLeft: '1px solid #C8C6C4' },
      },
      onClick: () => history.go(0),
    },
    {
      key: 'filter',
      text: 'Filter',
      iconProps: {
        iconName: 'Filter',
      },
    },
    {
      key: 'listView',
      text: 'List View',
      iconProps: {
        iconName: 'View',
      },
      onClick: onViewClick,
    },
    {
      key: 'delete',
      text: 'Delete',
      iconProps: {
        iconName: 'Delete',
      },
      onClick: onDeleteCameraClick,
      disabled: selectedCameraList.length === 0,
    },
    {
      key: 'feedback',
      text: 'Feedback',
      iconProps: {
        iconName: 'Emoji2',
      },
      onClick: () => {
        const win = window.open('https://go.microsoft.com/fwlink/?linkid=2173531', '_blank');
        win.focus();
      },
    },
    {
      key: 'learnMore',
      text: 'Learn more',
      iconProps: {
        iconName: 'NavigateExternalInline',
      },
      onClick: () => {
        const win = window.open(
          'https://github.com/Azure-Samples/azure-intelligent-edge-patterns/tree/master/factory-ai-vision',
          '_blank',
        );
        win.focus();
      },
    },
    {
      key: 'help',
      text: 'Troubleshooting',
      iconProps: {
        iconName: 'Help',
      },
      onClick: () => {
        const win = window.open(
          'https://github.com/Azure-Samples/azure-intelligent-edge-patterns/issues',
          '_blank',
        );
        win.focus();
      },
    },
  ];

  return (
    <>
      <CommandBar styles={{ root: { marginTop: '24px', paddingLeft: 0 } }} items={commandBarItems} />
      {cameraList.length ? (
        <CameraListManagement
          cameraList={cameraList}
          onCameraListSelect={onCameraListSelect}
          onCameraCardSelect={onCameraCardSelect}
          viewMode={viewMode}
        />
      ) : (
        <Stack styles={{ root: { paddingTop: '35px' } }}>
          <Label styles={{ root: { fontSize: '14px', lineHeight: '20px' } }}>
            Why do I need a Compute Device?
          </Label>
          <Text styles={{ root: { fontSize: '13px', lineHeight: '18px' } }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
            labore et dolore magna aliqua. Tristique senectus et netus et malesuada fames ac turpis egestas.
          </Text>
          <Text styles={{ root: { fontSize: '13px', lineHeight: '18px' } }}>
            Tristique senectus et netus et malesuada fames ac turpis egestas.
          </Text>
          <Stack horizontalAlign="center">
            <img
              src="/icons/camera/cameraTitle.png"
              alt="camera"
              style={{ marginTop: '20px', width: '240px', height: '170px' }}
            />
            <Stack tokens={{ childrenGap: 5 }}>
              <Label styles={{ root: { fontSize: '16px', lineHeight: '22px' } }}>No Cameras or Videos</Label>
              <Text styles={{ root: { fontSize: '13px', lineHeight: '18px' } }}>
                Would you like to add one?
              </Text>
            </Stack>
            <PrimaryButton style={{ marginTop: '30px' }} onClick={onCameraCreateRedirect}>
              Add
            </PrimaryButton>
          </Stack>
        </Stack>
      )}
    </>
  );
};

export default CamerasWrapper;
