// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Icon, Stack, Text } from '@fluentui/react';

interface Props {
  id: number;
  text: string;
  isDelete?: boolean;
  onDelete?: (id: number) => void;
  count?: number;
}

const Tag: React.FC<Props> = (props) => {
  const { id, text, isDelete, onDelete, count } = props;

  return (
    <Stack
      style={{
        backgroundColor: '#E7EFFF',
        fontSize: '14px',
        lineHeight: '20px',
        padding: '4px 8px',
        borderRadius: '2px',
        height: '34px',
      }}
      horizontal
      tokens={{ childrenGap: 5 }}
      verticalAlign="center"
    >
      <Text>{text}</Text>
      {count !== undefined && <Text>{count}</Text>}
      {isDelete && (
        <Icon styles={{ root: { cursor: 'pointer' } }} iconName="Cancel" onClick={() => onDelete(id)} />
      )}
    </Stack>
  );
};

export default Tag;
