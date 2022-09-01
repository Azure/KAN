// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { ComputeDevice } from '../../store/types';
import { ViewMode } from './types';

import List from './List/DeviceList';
import CardList from './List/CardList';

interface Props {
  deviceList: ComputeDevice[];
  viewMode: ViewMode;
  onDeviceCardSelect: (checked: boolean, cameraId: number) => void;
  onDeviceListSelect: (cameraIds: number[]) => void;
}

const ListManagement = (props: Props) => {
  const { deviceList, viewMode, onDeviceCardSelect, onDeviceListSelect } = props;

  return (
    <>
      {viewMode === 'card' ? (
        <CardList deviceList={deviceList} onDeviceCardSelect={onDeviceCardSelect} />
      ) : (
        <List deviceList={deviceList} onDeviceListSelect={onDeviceListSelect} />
      )}
    </>
  );
};

export default ListManagement;
