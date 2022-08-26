// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback } from 'react';
import { IContextualMenuProps, IconButton } from '@fluentui/react';
import { useDispatch } from 'react-redux';
import { useHistory, generatePath } from 'react-router-dom';

import { AiSkill } from '../../../store/types';
import { deleteCascade } from '../../../store/cascadeSlice';
import { Url } from '../../../constant';

interface Props {
  skill: AiSkill;
  iconName: string;
  onDeleteModalOpen: () => void;
}

const MenuButton = (props: Props) => {
  const { skill, iconName, onDeleteModalOpen } = props;

  const dispatch = useDispatch();
  const history = useHistory();

  const onPanelOpen = useCallback(() => {
    history.push(
      generatePath(Url.AI_SKILL_EDIT, {
        id: skill.id,
        step: 'basics',
      }),
    );
  }, [history, skill]);

  const onCameraDelete = useCallback(() => {
    dispatch(deleteCascade(skill.id));
  }, [dispatch, skill]);

  const menuProps: IContextualMenuProps = {
    items: [
      {
        key: 'edit',
        text: 'Edit AI Skill',
        iconProps: { iconName: 'Edit' },
        onClick: onPanelOpen,
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
