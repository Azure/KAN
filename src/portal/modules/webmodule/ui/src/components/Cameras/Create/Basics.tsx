// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useCallback, useMemo } from 'react';
import { Stack, Label, Link, IDropdownOption } from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { State as RootState } from 'RootStateType';
import { postLocation, selectAllLocations } from '../../../store/locationSlice';
import { selectAllComputeDevices } from '../../../store/computeDeviceSlice';
import { CreateCameraFormData, DeviceOption } from '../types';
import { CreateByNameDialog } from '../../CreateByNameDialog';
import { Url } from '../../../constant';

import HorizontalDropdown from '../../Common/HorizontalDropdown';
import HorizontalTextField from '../../Common/HorizontalTextField';

interface Props {
  localFormData: CreateCameraFormData;
  onFormDataChange: (formData: CreateCameraFormData) => void;
}

const getSelectedDeviceIds = (deviceList: DeviceOption[], option: IDropdownOption) => {
  if (option.selected) {
    return [...deviceList, { key: +option.key, text: option.text, data: option.data }];
  }
  return deviceList.filter((device) => device.key !== option.key);
};

const Basics = (props: Props) => {
  const { localFormData, onFormDataChange } = props;

  const locationList = useSelector((state: RootState) => selectAllLocations(state));
  const computeDeviceList = useSelector((state: RootState) => selectAllComputeDevices(state));
  const dispatch = useDispatch();
  const history = useHistory();

  const [dialogHidden, setDialogHidden] = useState(true);

  const locationOptions: IDropdownOption[] = useMemo(
    () =>
      locationList.map((l) => ({
        key: l.name,
        text: l.name,
      })),
    [locationList],
  );

  const deviceOptions: IDropdownOption[] = useMemo(
    () =>
      computeDeviceList.map((device) => ({
        key: device.id,
        text: device.name,
        data: device.kan_id,
      })),
    [computeDeviceList],
  );

  const onBasicFormChange = useCallback(
    (key: keyof CreateCameraFormData, newValue: string) => {
      onFormDataChange({
        ...localFormData,
        [key]: newValue,
        error: { ...localFormData.error, [key]: '' },
      });
    },
    [onFormDataChange, localFormData],
  );

  const onLocationCreate = useCallback(
    async (name: string) => {
      const res = (await dispatch(postLocation({ name }))) as any;

      onFormDataChange({ ...localFormData, location: res.payload.name });
    },
    [dispatch, localFormData, onFormDataChange],
  );

  return (
    <Stack styles={{ root: { paddingTop: '40px' } }}>
      <Label styles={{ root: { fontWeight: 600, lineHeight: '20px' } }}>Basic Info</Label>
      <Stack styles={{ root: { paddingTop: '10px' } }} tokens={{ childrenGap: 10 }}>
        <HorizontalTextField
          required
          label="Name"
          value={localFormData.name}
          onChange={(_, newValue) => onBasicFormChange('name', newValue)}
          errorMessage={localFormData.error.name}
        />
        {/* <ChoiceGroup
          selectedKey={localFormData.media_type}
          options={mediaOptions}
          onChange={(_, option?: IChoiceGroupOption) =>
            onFormDataChange({ ...localFormData, media_type: option.key as MediaType })
          }
          label="Use cameras or videos"
          required={true}
          styles={{ root: { display: 'flex' }, label: { width: '200px', fontWeight: 400 } }}
        /> */}
        {/* {localFormData.media_type === 'Video' && (
          <ChoiceGroup
            selectedKey={localFormData.videoType}
            options={videoOptions}
            onChange={(_, option?: IChoiceGroupOption) =>
              onFormDataChange({ ...localFormData, videoType: option.key as VideoType })
            }
            label="Use cameras or videos"
            required={true}
            styles={{
              root: { display: 'flex' },
              label: { width: '200px', fontWeight: 400 },
            }}
          />
        )} */}

        {localFormData.media_type === 'Camera' ? (
          <Stack tokens={{ childrenGap: 10 }}>
            <HorizontalTextField
              required
              label="RTSP URL"
              value={localFormData.rtsp}
              onChange={(_, newValue) => onBasicFormChange('rtsp', newValue)}
              errorMessage={localFormData.error.rtsp}
            />
            <HorizontalTextField
              label="Username"
              value={localFormData.userName}
              onChange={(_, newValue) => onBasicFormChange('userName', newValue)}
            />
            <HorizontalTextField
              label="Password"
              value={localFormData.password}
              onChange={(_, newValue) => onBasicFormChange('password', newValue)}
            />
            <Stack horizontal tokens={{ childrenGap: 20 }}>
              <Stack>
                <HorizontalDropdown
                  label="Select compute devices"
                  selectedKeys={localFormData.selectedDeviceList.map((device) => device.key)}
                  options={deviceOptions}
                  onChange={(_, option) =>
                    onFormDataChange({
                      ...localFormData,
                      selectedDeviceList: getSelectedDeviceIds(localFormData.selectedDeviceList, option),
                      error: { ...localFormData.error, selectedDeviceList: '' },
                    })
                  }
                  required
                  multiSelect
                  errorMessage={localFormData.error.selectedDeviceList}
                />
                <Link
                  styles={{
                    root: { paddingLeft: '200px', fontSize: '13px', lineHeight: '18px', width: '100%' },
                  }}
                  onClick={() => history.push(Url.COMPUTE_DEVICE)}
                >
                  Create one
                </Link>
              </Stack>
            </Stack>
          </Stack>
        ) : (
          <HorizontalTextField
            required
            label="URL"
            value={localFormData.media_source}
            onChange={(_, newValue) => onBasicFormChange('media_source', newValue)}
            errorMessage={localFormData.error.mediaSource}
          />
        )}

        <Stack>
          <HorizontalDropdown
            label="Location"
            selectedKey={localFormData.location}
            options={locationOptions}
            onChange={(_, option) =>
              onFormDataChange({
                ...localFormData,
                location: option.key as string,
                error: { ...localFormData.error, location: '' },
              })
            }
            required
            errorMessage={localFormData.error.location}
          />
          <Link
            styles={{
              root: { paddingLeft: '200px', fontSize: '13px', lineHeight: '18px', width: '100%' },
            }}
            onClick={() => setDialogHidden(false)}
          >
            Create one
          </Link>
        </Stack>
        <CreateByNameDialog
          title="Create location"
          subText="Enter the location where this camera is pointed:"
          hidden={dialogHidden}
          onDismiss={() => setDialogHidden(true)}
          onCreate={onLocationCreate}
        />
      </Stack>
    </Stack>
  );
};

export default Basics;
