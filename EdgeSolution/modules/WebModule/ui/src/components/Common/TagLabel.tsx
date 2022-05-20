import React from 'react';
import { Icon, Stack, Text, IStackStyles } from '@fluentui/react';

interface Props extends IStackStyles {
  id: number;
  text: string;
  onDelete: (id: number) => void;
}

const TagLabel: React.FC<Props> = (props) => {
  const { id, text, onDelete, root } = props;

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
      styles={{ root }}
      horizontal
      tokens={{ childrenGap: 5 }}
    >
      <Text>{text}</Text>
      <Icon styles={{ root: { cursor: 'pointer' } }} iconName="Cancel" onClick={() => onDelete(id)} />
    </Stack>
  );
};

export default TagLabel;
