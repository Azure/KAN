import React from 'react';
import { Icon, Stack, Text } from '@fluentui/react';

interface Props {
  id: number;
  text: string;
  onDelete: (id: number) => void;
}

const Tag: React.FC<Props> = (props) => {
  const { id, text, onDelete } = props;

  return (
    <Stack
      style={{
        backgroundColor: '#E7EFFF',
        fontSize: '14px',
        lineHeight: '20px',
        padding: '8px 4px',
        borderRadius: '2px',
        height: '34px',
      }}
      horizontal
      tokens={{ childrenGap: 5 }}
    >
      <Text>{text}</Text>
      <Icon styles={{ root: { cursor: 'pointer' } }} iconName="Cancel" onClick={() => onDelete(id)} />
    </Stack>
  );
};

export default Tag;
