// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo } from 'react';
import { DetailsList, Selection, IColumn, SelectionMode, Text } from '@fluentui/react';

import { ComputeDevice } from '../../../store/types';
import { theme } from '../../../constant';

import MenuButton from '../../Common/MenuButton';

interface Props {
  deviceList: ComputeDevice[];
  onDeviceListSelect: (Ids: number[]) => void;
}

const DeviceList = (props: Props) => {
  const { deviceList, onDeviceListSelect } = props;

  const selection = useMemo(
    () =>
      new Selection({
        onSelectionChanged: () => {
          const selectedCameraList = selection.getSelection() as ComputeDevice[];

          onDeviceListSelect(selectedCameraList.map((c) => c.id));
        },
        selectionMode: SelectionMode.multiple,
      }),
    [onDeviceListSelect],
  );

  const columns: IColumn[] = [
    {
      key: 'name',
      minWidth: 50,
      maxWidth: 100,
      name: 'Name',
      fieldName: 'name',
    },
    {
      key: 'acceleration',
      minWidth: 250,
      maxWidth: 250,
      name: 'Acceleration',
      fieldName: 'acceleration',
      onRender: (item: ComputeDevice) => <Text>{item.acceleration}</Text>,
    },
    {
      key: 'cPUArchitecture',
      minWidth: 550,
      maxWidth: 550,
      name: 'CPU Architecture',
      fieldName: 'cpuArchitecture',
      onRender: (item: ComputeDevice) => <Text>{item.architecture}</Text>,
    },
    {
      key: 'control',
      minWidth: 50,
      maxWidth: 50,
      name: '',
      onRender: (item: ComputeDevice) => (
        <MenuButton
          onDeleteModalOpen={() => console.log(item)}
          onTargetSelected={() => console.log(item)}
          iconName="More"
        />
      ),
    },
  ];

  return (
    <DetailsList
      styles={{
        root: {
          '.ms-DetailsRow-cell': {
            display: 'flex',
            alignItems: 'center',
            color: theme.palette.neutralPrimary,
            fontSize: '13px',
          },
        },
      }}
      items={deviceList}
      columns={columns}
      selection={selection}
    />
  );
};

export default DeviceList;
