// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { IContextualMenuProps, IconButton } from '@fluentui/react';

interface Props {
  iconName: string;
  onTargetSelected: () => void;
  onDeleteModalOpen: () => void;
}

const MenuButton = (props: Props) => {
  const { iconName, onTargetSelected, onDeleteModalOpen } = props;

  const menuProps: IContextualMenuProps = {
    items: [
      {
        key: 'edit',
        text: 'See Properties',
        iconProps: { iconName: 'Equalizer' },
        onClick: onTargetSelected,
      },
      // {
      //   key: 'view',
      //   text: 'View Definition',
      //   iconProps: { iconName: 'View' },
      //   onClick: onTargetSelected,
      // },
      {
        key: 'delete',
        text: 'Delete',
        iconProps: { iconName: 'Delete' },
        onClick: onDeleteModalOpen,
      },
    ],
  };

  return (
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
  );
};

export default MenuButton;
