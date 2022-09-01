// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack, Text, mergeStyleSets } from '@fluentui/react';

import { theme } from '../../constant';

import { getFilteredTagList, Tag } from './TagTab';

interface Props {
  tagList: Tag[];
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

const PreviewTag = (props: Props) => {
  const { tagList } = props;

  const filteredTagList = getFilteredTagList(tagList);

  const classes = getClasses();

  return (
    <Stack horizontal verticalAlign="start">
      <Text className={classes.title}>Tags</Text>
      <Stack>
        <Text className={classes.content}>
          {filteredTagList.map((tag, idx) => (
            <Stack key={idx} horizontal tokens={{ childrenGap: 5 }}>
              <Text>{tag.name}</Text>
              <Text>:</Text>
              <Text>{tag.value}</Text>
            </Stack>
          ))}
        </Text>
      </Stack>
    </Stack>
  );
};

export default PreviewTag;
