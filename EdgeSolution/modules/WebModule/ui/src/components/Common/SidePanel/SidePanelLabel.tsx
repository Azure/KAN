import React from 'react';
import { Stack, Text } from '@fluentui/react';

import { theme } from '../../../constant';

interface Props {
  title: string;
  content: string;
}

const SidePanelLabel = (props: Props) => {
  const { title, content } = props;

  return (
    <Stack>
      <Text styles={{ root: { color: theme.palette.neutralSecondaryAlt, paddingBottom: '5px' } }}>
        {title}
      </Text>
      <Text styles={{ root: { color: theme.palette.black } }}>{content}</Text>
    </Stack>
  );
};

export default SidePanelLabel;
