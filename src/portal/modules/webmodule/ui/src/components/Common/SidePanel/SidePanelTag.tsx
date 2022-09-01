// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack, Text } from '@fluentui/react';

import { theme } from '../../../constant';

interface Props {
  tagList: { name: string; value: string }[];
}

const SidePanelTag = (props: Props) => {
  const { tagList } = props;

  if (tagList.length === 0) return <></>;

  return (
    <Stack>
      <Text styles={{ root: { color: theme.palette.neutralSecondaryAlt, paddingBottom: '5px' } }}>Tags</Text>
      <Stack styles={{ root: { color: theme.palette.black } }}>
        {tagList.length > 0 &&
          tagList.map((tag, idx) => <Text key={idx}>{`${tag.name} : ${tag.value}`}</Text>)}
      </Stack>
    </Stack>
  );
};

export default SidePanelTag;
