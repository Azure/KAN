import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ICommandBarItemProps, CommandBar, Stack, Text, PrimaryButton, Label } from '@fluentui/react';
import { useHistory } from 'react-router-dom';

import { State as RootState } from 'RootStateType';
import { selectAllComputeDevices, deleteComputeDevice } from '../../store/computeDeviceSlice';
import { commonCommandBarItems } from '../utils';
import { Url } from '../../constant';
import { ViewMode } from './types';

import ListManagement from './ListManagement';

const ComputeDeviceDetail = () => {
  const computeDeviceList = useSelector((state: RootState) => selectAllComputeDevices(state));

  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [selectedDeviceList, setSelectedDeviceList] = useState([]);

  const history = useHistory();
  const dispatch = useDispatch();

  const onDeviceCardSelect = useCallback((checked: boolean, cameraId: number) => {
    setSelectedDeviceList((prev) => {
      if (checked) return [...prev, cameraId];
      return prev.filter((id) => cameraId !== id);
    });
  }, []);

  const onDeviceListSelect = useCallback((cameraIds: number[]) => {
    setSelectedDeviceList(cameraIds);
  }, []);

  const onDeviceDelete = useCallback(() => {
    dispatch(deleteComputeDevice(selectedDeviceList));
  }, [dispatch, selectedDeviceList]);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'add',
      text: 'Add Device',
      iconProps: {
        iconName: 'Add',
      },
      onClick: () => history.push(Url.COMPUTE_DEVICE_CREATION_BASIC),
    },
    {
      key: 'refresh',
      text: 'Refresh',
      iconProps: {
        iconName: 'Refresh',
      },
      buttonStyles: {
        root: { borderLeft: '1px solid #C8C6C4' },
      },
      onClick: () => history.go(0),
    },
    {
      key: 'filter',
      text: 'Filter',
      iconProps: {
        iconName: 'Filter',
      },
    },
    {
      key: 'listView',
      text: 'List View',
      iconProps: {
        iconName: 'View',
      },
      onClick: () => setViewMode((prev) => (prev === 'card' ? 'list' : 'card')),
    },
    {
      key: 'delete',
      text: 'Delete',
      iconProps: {
        iconName: 'Delete',
      },
      onClick: () => onDeviceDelete(),
    },
    ...commonCommandBarItems,
  ];

  return (
    <div>
      <CommandBar styles={{ root: { marginTop: '24px', paddingLeft: 0 } }} items={commandBarItems} />
      {computeDeviceList.length !== 0 ? (
        <ListManagement
          deviceList={computeDeviceList}
          viewMode={viewMode}
          onDeviceCardSelect={onDeviceCardSelect}
          onDeviceListSelect={onDeviceListSelect}
        />
      ) : (
        <Stack styles={{ root: { paddingTop: '35px' } }}>
          <Label styles={{ root: { fontSize: '14px', lineHeight: '20px' } }}>
            Why do I need a Compute Device?
          </Label>
          <Text styles={{ root: { fontSize: '13px', lineHeight: '18px' } }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
            labore et dolore magna aliqua. Tristique senectus et netus et malesuada fames ac turpis egestas.
          </Text>
          <Text styles={{ root: { fontSize: '13px', lineHeight: '18px' } }}>
            Tristique senectus et netus et malesuada fames ac turpis egestas.
          </Text>
          <Stack horizontalAlign="center">
            <img
              src="/icons/computeDevice/computeDeviceTitle.png"
              alt="computeDevice"
              style={{ marginTop: '20px', width: '240px', height: '170px' }}
            />
            <Stack tokens={{ childrenGap: 5 }}>
              <Label styles={{ root: { fontSize: '16px', lineHeight: '22px' } }}>No Compute Devices</Label>
              <Text styles={{ root: { fontSize: '13px', lineHeight: '18px' } }}>
                Would you like to add one?
              </Text>
            </Stack>
            <PrimaryButton
              style={{ marginTop: '30px' }}
              onClick={() => history.push(Url.COMPUTE_DEVICE_CREATION_BASIC)}
            >
              Add
            </PrimaryButton>
          </Stack>
        </Stack>
      )}
    </div>
  );
};

export default ComputeDeviceDetail;
