// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback } from 'react';
import { IContextualMenuProps, IconButton } from '@fluentui/react';
import { useHistory, generatePath } from 'react-router-dom';

import { Deployment } from '../../../store/types';
import { Url } from '../../../constant';

interface Props {
  deployemnt: Deployment;
  iconName: string;
  onDeleteModalOpen: () => void;
  onDefinitionOpen: () => void;
}

const MenuButton = (props: Props) => {
  const { deployemnt, iconName, onDeleteModalOpen, onDefinitionOpen } = props;

  const history = useHistory();

  const onRedirectClick = useCallback(() => {
    history.push(
      generatePath(Url.DEPLOYMENT_EDIT, {
        id: deployemnt.id,
        step: 'basics',
      }),
    );
  }, [history, deployemnt]);

  const menuProps: IContextualMenuProps = {
    items: [
      {
        key: 'edit',
        text: 'Edit Deployment',
        iconProps: { iconName: 'Edit' },
        onClick: onRedirectClick,
      },
      {
        key: 'view',
        text: 'View Definition',
        iconProps: { iconName: 'View' },
        onClick: onDefinitionOpen,
      },
      {
        key: 'delete',
        text: 'Delete',
        iconProps: { iconName: 'Delete' },
        onClick: onDeleteModalOpen,
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
    </>
  );
};

export default MenuButton;
