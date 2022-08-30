// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  ICommandBarItemProps,
  CommandBar,
  Stack,
  Text,
  PrimaryButton,
  Label,
  SearchBox,
  ActionButton,
} from '@fluentui/react';
import { useHistory } from 'react-router-dom';
import { isEmpty } from 'ramda';

import { deleteComputeDevice } from '../../store/computeDeviceSlice';
import { commonCommandBarItems } from '../utils';
import { theme, Url } from '../../constant';
import { ViewMode } from './types';
import { ComputeDevice } from '../../store/types';
import {
  getDropOptions,
  getMinContentList,
  getFilterdDeviceList,
  DeviceFieldMap,
  DeviceFieldKey,
} from './utils';

import ListManagement from './ListManagement';
import FilteredDropdownLabel from '../Common/FilteredDropdownLabel';

interface Props {
  deviceList: ComputeDevice[];
}

const ComputeDeviceDetail = (props: Props) => {
  const { deviceList } = props;

  const [isFilter, setIsFilter] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [selectedDeviceList, setSelectedDeviceList] = useState([]);
  const [localDeviceList, setLocalDeviceList] = useState<ComputeDevice[]>(deviceList);
  const [filterFieldMap, setFilterFieldMap] = useState<DeviceFieldMap>({
    acceleration: [],
    architecture: [],
  });
  const [filterValue, setFilterValue] = useState('');

  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isEmpty(filterValue)) {
      setLocalDeviceList(deviceList);
    } else {
      const filteredDeviceList = getFilterdDeviceList(deviceList, filterValue);

      setLocalDeviceList(filteredDeviceList);
    }
  }, [filterValue, deviceList]);

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
    dispatch(deleteComputeDevice({ ids: selectedDeviceList }));
  }, [dispatch, selectedDeviceList]);

  const onFilteredFieldApply = useCallback((ids: number[], target: DeviceFieldKey) => {
    setFilterFieldMap((prev) => ({ ...prev, [target]: ids }));
  }, []);

  const onFilterClear = useCallback(() => {
    setFilterValue('');
    setFilterFieldMap({
      acceleration: [],
      architecture: [],
    });
  }, []);

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
      onClick: () => setIsFilter((prev) => !prev),
    },
    // {
    //   key: 'listView',
    //   text: 'List View',
    //   iconProps: {
    //     iconName: 'View',
    //   },
    //   onClick: () => setViewMode((prev) => (prev === 'card' ? 'list' : 'card')),
    // },
    // {
    //   key: 'delete',
    //   text: 'Delete',
    //   iconProps: {
    //     iconName: 'Delete',
    //   },
    //   onClick: () => onDeviceDelete(),
    // },
    ...commonCommandBarItems,
  ];

  return (
    <>
      <CommandBar styles={{ root: { marginTop: '24px', paddingLeft: 0 } }} items={commandBarItems} />
      {deviceList.length !== 0 ? (
        <>
          {isFilter && (
            <Stack
              styles={{ root: { padding: '10px 0' } }}
              horizontal
              tokens={{ childrenGap: 10 }}
              verticalAlign="center"
            >
              <SearchBox
                styles={{ root: { width: '180px' } }}
                placeholder="Search"
                onSearch={(newValue) => setFilterValue(newValue)}
                onClear={() => setFilterValue('')}
                onChange={(_, newValue) => setFilterValue(newValue)}
              />
              <Stack horizontal tokens={{ childrenGap: 10 }}>
                <FilteredDropdownLabel
                  lablelTitle="Acceleration"
                  currentOptionList={Object.entries(
                    getDropOptions(getMinContentList(localDeviceList, filterFieldMap), 'acceleration'),
                  )}
                  onContentChange={(newIds) => onFilteredFieldApply(newIds, 'acceleration')}
                  selectedObjectNameList={Object.keys(
                    getDropOptions(
                      localDeviceList.filter((device) => filterFieldMap.acceleration.includes(device.id)),
                      'acceleration',
                    ),
                  )}
                  onContentCancel={() => onFilteredFieldApply([], 'acceleration')}
                />
                <FilteredDropdownLabel
                  lablelTitle="Architecture"
                  currentOptionList={Object.entries(
                    getDropOptions(getMinContentList(localDeviceList, filterFieldMap), 'architecture'),
                  )}
                  onContentChange={(newIds) => onFilteredFieldApply(newIds, 'architecture')}
                  selectedObjectNameList={Object.keys(
                    getDropOptions(
                      localDeviceList.filter((device) => filterFieldMap.architecture.includes(device.id)),
                      'architecture',
                    ),
                  )}
                  onContentCancel={() => onFilteredFieldApply([], 'architecture')}
                />
              </Stack>
              <ActionButton
                styles={{ root: { color: theme.palette.themeSecondary } }}
                onClick={onFilterClear}
              >
                Reset
              </ActionButton>
            </Stack>
          )}
          <ListManagement
            deviceList={getMinContentList(localDeviceList, filterFieldMap)}
            viewMode={viewMode}
            onDeviceCardSelect={onDeviceCardSelect}
            onDeviceListSelect={onDeviceListSelect}
          />
        </>
      ) : (
        <Stack styles={{ root: { paddingTop: '35px' } }}>
          <Label styles={{ root: { fontSize: '14px', lineHeight: '20px' } }}>
            Why do I need Compute Devices?
          </Label>
          <Text styles={{ root: { fontSize: '13px', lineHeight: '18px' } }}>
            The compute device hold all the components for your vision-based AI solution.
          </Text>
          <Stack
            styles={{ root: { paddingTop: '95px' } }}
            horizontalAlign="center"
            tokens={{ childrenGap: 20 }}
          >
            <img
              src="/icons/computeDevice/computeDeviceTitle.png"
              alt="computeDevice"
              style={{ marginTop: '20px', width: '160px', height: '140px' }}
            />
            <Stack tokens={{ childrenGap: 5 }}>
              <Label styles={{ root: { fontSize: '16px', lineHeight: '22px' } }}>No Compute Devices</Label>
              <Text styles={{ root: { fontSize: '13px', lineHeight: '18px' } }}>
                Would you like to add one?
              </Text>
            </Stack>
            <PrimaryButton onClick={() => history.push(Url.COMPUTE_DEVICE_CREATION_BASIC)}>Add</PrimaryButton>
          </Stack>
        </Stack>
      )}
    </>
  );
};

export default ComputeDeviceDetail;