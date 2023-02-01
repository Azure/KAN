// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack, Text, mergeStyleSets } from '@fluentui/react';

import { theme } from '../../constant';

interface Props {
  title: string;
  content: string;
}

const getClasses = () =>
  mergeStyleSets({
    title: {
      color: theme.palette.neutralPrimary,
      fontSize: '13px',
      lineHeight: '18px',
      width: '200px',
    },
    content: {
      fontSize: '13px',
      lineHeight: '18px',
      color: theme.palette.neutralSecondary,
    },
  });

const PreviewLabel = (props: Props) => {
  const { title, content } = props;

  const classes = getClasses();

  return (
    <Stack horizontal>
      <Text className={classes.title}>{title}</Text>
      <Text className={classes.content}>{content}</Text>
    </Stack>
  );
};

export default PreviewLabel;
