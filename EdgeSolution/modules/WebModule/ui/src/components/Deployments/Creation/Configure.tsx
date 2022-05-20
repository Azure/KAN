import React, { useMemo, useCallback } from 'react';
import { Stack, Text, DetailsList, IColumn, IconButton, IContextualMenuProps } from '@fluentui/react';
// import { DetailsList, Selection, IColumn, SelectionMode } from '@fluentui/react';

interface Props {
  cameraList: { key: number; text: string }[];
}

const Configure = (props: Props) => {
  const { cameraList } = props;

  const menuProps: IContextualMenuProps = {
    items: [
      {
        key: 'delete',
        text: 'Remove camera',
        iconProps: { iconName: 'Delete' },
        onClick: () => {},
      },
    ],
  };

  const columns: IColumn[] = [
    {
      key: 'camera',
      minWidth: 150,
      maxWidth: 150,
      name: 'Camera',
      fieldName: 'text',
    },
    {
      key: 'configure',
      minWidth: 250,
      maxWidth: 250,
      name: 'AI Skills',
      fieldName: 'media_type',
      onRender: () => <Text>Configure</Text>,
    },
    {
      key: 'status',
      minWidth: 250,
      maxWidth: 250,
      name: 'Status',
      fieldName: '',
    },
    {
      key: 'button',
      minWidth: 550,
      maxWidth: 550,
      name: '',
      fieldName: '',
      onRender: () => <IconButton menuIconProps={{ iconName: 'More' }} menuProps={menuProps} />,
    },
  ];

  return (
    <Stack styles={{ root: { paddingTop: '40px' } }}>
      <Text>
        Link your cameras to AI skill by selecting your cameras below and clicking ‘Add AI Skills’ above. Each
        camera must have a skill configured in order to progress.
      </Text>
      <DetailsList
        columns={columns}
        items={cameraList}
        // checkboxVisibility={CheckboxVisibility.hidden}
        // onActiveItemChanged={onRowClick}
      />
    </Stack>
  );
};

export default Configure;
