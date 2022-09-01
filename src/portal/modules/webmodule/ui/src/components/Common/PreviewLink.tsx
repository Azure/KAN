// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { ActionButton } from '@fluentui/react';

import { theme } from '../../constant';

interface Props {
  title: string;
  onClick: () => void;
}

const PreviewLink = (props: Props) => {
  const { title, onClick } = props;

  return (
    <ActionButton
      styles={{
        root: { color: theme.palette.themeSecondary, padding: 0, paddingLeft: '200px' },
      }}
      onClick={onClick}
      iconProps={{ iconName: 'Edit' }}
    >
      {title}
    </ActionButton>
  );
};

export default PreviewLink;
