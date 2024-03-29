// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useState, useEffect } from 'react';
import {
  CommandBar,
  ICommandBarItemProps,
  Stack,
  Text,
  PrimaryButton,
  Label,
  SearchBox,
  ActionButton,
} from '@fluentui/react';
import { useHistory, useLocation } from 'react-router-dom';
import { isEmpty } from 'ramda';

import { Url, theme } from '../../constant';
import { Camera } from '../../store/cameraSlice';
import { ViewMode } from './types';
import { commonCommandBarItems } from '../utils';
import {
  getFilterdCameraList,
  getDropOptions,
  getMinContentList,
  CameraFieldMap,
  CameraFieldKey,
} from './utils';

import CameraListManagement from './List/CameraListManagement';
import FilteredDropdownLabel from '../Common/FilteredDropdownLabel';
import CraeteMessageBar, { LocationState } from '../Common/CraeteMessageBar';

interface Props {
  cameraList: Camera[];
}

const CamerasDetailWrapper = (props: Props) => {
  const { cameraList } = props;

  const history = useHistory();
  const location = useLocation<LocationState>();

  const [isFilter, setIsFilter] = useState<boolean>(false);
  const [_, setSelectedCameraList] = useState([]);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [filterValue, setFilterValue] = useState('');
  const [localFormattedCamera, setLocalFormattedCamera] = useState<Camera[]>([]);
  const [filterFieldMap, setFilterFieldMap] = useState<CameraFieldMap>({
    location: [],
  });
  const [localCreated, setLocalCreated] = useState(location.state?.isCreated);

  useEffect(() => {
    if (isEmpty(filterValue)) {
      setLocalFormattedCamera(cameraList);
    } else {
      setLocalFormattedCamera(getFilterdCameraList(cameraList, filterValue));
    }
  }, [cameraList, filterValue]);

  const onCameraCardSelect = useCallback((checked: boolean, cameraId: number) => {
    setSelectedCameraList((prev) => {
      if (checked) return [...prev, cameraId];
      return prev.filter((id) => cameraId !== id);
    });
  }, []);

  const onCameraListSelect = useCallback((cameraIds: number[]) => {
    setSelectedCameraList(cameraIds);
  }, []);

  const onCameraCreateRedirect = useCallback(() => {
    history.push(Url.CAMERAS_CREATION_BASICS);
  }, [history]);

  const onViewClick = useCallback(() => {
    setViewMode((prev) => (prev === 'card' ? 'list' : 'card'));
  }, []);

  const onInputSearch = useCallback(
    (newValue: string) => {
      const filteredCameraList = getFilterdCameraList(cameraList, newValue);
      setLocalFormattedCamera(filteredCameraList);
    },
    [cameraList],
  );

  const onInputChange = useCallback((newValue: string) => {
    if (isEmpty(newValue)) {
      setFilterValue('');
    }
  }, []);

  const onFilteredFieldApply = useCallback((ids: number[], target: CameraFieldKey) => {
    setFilterFieldMap((prev) => ({ ...prev, [target]: ids }));
  }, []);

  const onFilterClear = useCallback(() => {
    setFilterValue('');
    setFilterFieldMap({
      location: [],
    });
  }, []);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'add',
      text: 'Add Camera',
      iconProps: {
        iconName: 'Add',
      },
      onClick: onCameraCreateRedirect,
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
    //   onClick: onViewClick,
    // },
    // {
    //   key: 'delete',
    //   text: 'Delete',
    //   iconProps: {
    //     iconName: 'Delete',
    //   },
    //   onClick: onDeleteCameraClick,
    //   disabled: selectedCameraList.length === 0,
    // },
    ...commonCommandBarItems,
  ];

  return (
    <section>
      <CommandBar styles={{ root: { marginTop: '24px', paddingLeft: 0 } }} items={commandBarItems} />
      {cameraList.length > 0 ? (
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
                onSearch={(newValue) => onInputSearch(newValue)}
                onClear={() => setFilterValue('')}
                onChange={(_, newValue) => onInputChange(newValue)}
              />
              <Stack horizontal tokens={{ childrenGap: 10 }}>
                <FilteredDropdownLabel
                  lablelTitle="Location"
                  currentOptionList={Object.entries(
                    getDropOptions(getMinContentList(localFormattedCamera, filterFieldMap), 'location'),
                  )}
                  onContentChange={(newIds) => onFilteredFieldApply(newIds, 'location')}
                  selectedObjectNameList={Object.keys(
                    getDropOptions(
                      localFormattedCamera.filter((camera) => filterFieldMap.location.includes(camera.id)),
                      'location',
                    ),
                  )}
                  onContentCancel={() => onFilteredFieldApply([], 'location')}
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
          {localCreated && (
            <CraeteMessageBar pageType="camera" onMessageBarClose={() => setLocalCreated(false)} />
          )}
          <Stack style={{ marginTop: '25px', fontSize: '13px' }}>
            Below are the cameras you have successfully onboarded. To continue setting up your project, simply
            select the cameras you wish to proceed with.
          </Stack>
          <CameraListManagement
            cameraList={getMinContentList(localFormattedCamera, filterFieldMap)}
            onCameraListSelect={onCameraListSelect}
            onCameraCardSelect={onCameraCardSelect}
            viewMode={viewMode}
          />
        </>
      ) : (
        <Stack styles={{ root: { paddingTop: '35px' } }}>
          <Label styles={{ root: { fontSize: '14px', lineHeight: '20px' } }}>Why do I need a Camera?</Label>
          <Text styles={{ root: { fontSize: '13px', lineHeight: '18px' } }}>
            Cameras provide real-time data for your AI solution running on your compute device.
          </Text>
          <Stack horizontalAlign="center" styles={{ root: { paddingTop: '80px' } }}>
            <img
              src="/icons/camera/cameraTitle.png"
              alt="camera"
              style={{ marginTop: '20px', width: '140px', height: '90px' }}
            />
            <Stack tokens={{ childrenGap: 5 }}>
              <Label styles={{ root: { fontSize: '16px', lineHeight: '22px', textAlign: 'center' } }}>
                No Cameras
              </Label>
              <Text styles={{ root: { fontSize: '13px', lineHeight: '18px' } }}>
                Would you like to add one?
              </Text>
            </Stack>
            <PrimaryButton style={{ marginTop: '30px' }} onClick={onCameraCreateRedirect}>
              Add
            </PrimaryButton>
          </Stack>
        </Stack>
      )}
    </section>
  );
};

export default CamerasDetailWrapper;
