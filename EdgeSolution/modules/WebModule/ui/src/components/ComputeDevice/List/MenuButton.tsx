import React, { useCallback, useState } from 'react';
import { IContextualMenuProps, IconButton } from '@fluentui/react';
import { useDispatch } from 'react-redux';

import { ComputeDevice } from '../../../store/types';
import { deleteComputeDevice } from '../../../store/computeDeviceSlice';

import DeviceSidePanel from '../DeviceSidePanel';

interface Props {
  device: ComputeDevice;
  iconName: string;
}

const MenuButton = (props: Props) => {
  const { device, iconName } = props;

  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);

  const onPanelOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const onCameraDelete = useCallback(() => {
    dispatch(deleteComputeDevice([device.id]));
  }, [dispatch, device]);

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
      {isOpen && <DeviceSidePanel device={device} onPanelClose={() => setIsOpen(false)} />}
    </>
  );
};

export default MenuButton;
