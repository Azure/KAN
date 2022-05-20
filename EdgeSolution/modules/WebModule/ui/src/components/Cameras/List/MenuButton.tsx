import React, { useCallback, useState } from 'react';
import { IContextualMenuProps, IconButton } from '@fluentui/react';
import { useDispatch } from 'react-redux';

import { Camera, deleteCameras } from '../../../store/cameraSlice';

import CameraSidePanel from '../CameraSidePanel';

interface Props {
  camera: Camera;
  iconName: string;
}

const MenuButton = (props: Props) => {
  const { camera, iconName } = props;

  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);

  const onPanelOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const onCameraDelete = useCallback(() => {
    dispatch(deleteCameras([camera.id]));
  }, [dispatch, camera]);

  const menuProps: IContextualMenuProps = {
    items: [
      {
        key: 'edit',
        text: 'Edit Camera',
        iconProps: { iconName: 'Embed' },
        onClick: onPanelOpen,
      },
      {
        key: 'delete',
        text: 'Delete',
        iconProps: { iconName: 'Delete' },
        onClick: onCameraDelete,
      },
    ],
  };

  return (
    <>
      <IconButton
        styles={{
          root: {
            padding: '10px',
            marginRight: '10px',
            '& i': {
              fontSize: '24px',
            },
            ':hover': {
              cursor: 'pointer',
            },
          },
        }}
        menuProps={menuProps}
        menuIconProps={{ iconName }}
      />
      {isOpen && <CameraSidePanel camera={camera} onPanelClose={() => setIsOpen(false)} />}
    </>
  );
};

export default MenuButton;
