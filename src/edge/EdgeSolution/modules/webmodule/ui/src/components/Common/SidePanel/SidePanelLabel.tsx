// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack, Text } from '@fluentui/react';

import { theme } from '../../../constant';

interface Props {
  title: string;
  content?: string;
  contentElement?: JSX.Element;
}

const SidePanelLabel = (props: Props) => {
  const { title, content, contentElement } = props;

  return (
    <Stack>
      <Text styles={{ root: { color: theme.palette.neutralSecondaryAlt, paddingBottom: '5px' } }}>
        {title}
      </Text>
      {!!content && (
        <Text styles={{ root: { color: theme.palette.black, wordBreak: 'break-all' } }}>{content}</Text>
      )}
      {!!contentElement && contentElement}
    </Stack>
  );
};

export default SidePanelLabel;
