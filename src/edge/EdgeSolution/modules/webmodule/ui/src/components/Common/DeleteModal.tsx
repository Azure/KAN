// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Modal, Label, Stack, Text, PrimaryButton, DefaultButton, mergeStyleSets } from '@fluentui/react';

type PageType = 'device' | 'camera' | 'model' | 'skill' | 'deployment';

interface Props {
  name: string;
  type: PageType;
  onDelte: () => void;
  onClose: () => void;
}

const getDisplayPageTitle = (type: PageType) => {
  switch (type) {
    case 'device':
      return 'compute device';
    case 'camera':
      return 'camera';
    case 'model':
      return 'model';
    case 'skill':
      return 'ai skill';
    case 'deployment':
      return 'ai deployment';
    default:
      return '';
  }
};

const getClasses = () =>
  mergeStyleSets({
    modalMain: { width: '1060px', padding: '15px 20px' },
    content: {
      display: 'flex',
      justifyContent: 'space-between',
      height: '130px',
      flexFlow: 'column',
    },
    title: { fontSize: '18px', lineHeight: '24px' },
  });

const DeleteModal = (props: Props) => {
  const { name, onDelte, onClose, type } = props;

  const classes = getClasses();

  return (
    <Modal
      styles={{
        main: classes.modalMain,
        scrollableContent: classes.content,
      }}
      isOpen={true}
      isBlocking={true}
    >
      <Stack>
        <Label styles={{ root: classes.title }}>{`Delete ${name}`}</Label>
        <Text>
          This action will permanently delete the {getDisplayPageTitle(type)} {name}
        </Text>
      </Stack>
      <Stack horizontal tokens={{ childrenGap: 10 }}>
        <PrimaryButton onClick={onDelte}>Delete</PrimaryButton>
        <DefaultButton onClick={onClose}>Cancel</DefaultButton>
      </Stack>
    </Modal>
  );
};

export default DeleteModal;
