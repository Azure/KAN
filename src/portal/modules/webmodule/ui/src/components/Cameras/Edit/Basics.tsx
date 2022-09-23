// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useCallback, useMemo } from 'react';
import { Stack, Label, Link, IDropdownOption } from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { postLocation, selectAllLocations } from '../../../store/locationSlice';
import { selectAllComputeDevices } from '../../../store/computeDeviceSlice';
import { UpdateCameraFormData } from '../types';
import { CreateByNameDialog } from '../../CreateByNameDialog';

import HorizontalDropdown from '../../Common/HorizontalDropdown';
import HorizontalTextField from '../../Common/HorizontalTextField';

interface Props {
  localFormData: UpdateCameraFormData;
  onFormDataChange: (formData: UpdateCameraFormData) => void;
}

const Basics = (props: Props) => {
  const { localFormData, onFormDataChange } = props;

  const locationList = useSelector((state: RootState) => selectAllLocations(state));
  const computeDeviceList = useSelector((state: RootState) => selectAllComputeDevices(state));
  const dispatch = useDispatch();

  const [dialogHidden, setDialogHidden] = useState(true);

  const locationOptions: IDropdownOption[] = useMemo(
    () =>
      locationList.map((l) => ({
        key: l.name,
        text: l.name,
      })),
    [locationList],
  );

  const onLocationCreate = useCallback(
    async (name: string) => {
      const res = (await dispatch(postLocation({ name }))) as any;

      onFormDataChange({ ...localFormData, location: res.payload.id });
    },
    [dispatch, localFormData, onFormDataChange],
  );

  return (
    <Stack styles={{ root: { padding: '40px 0' } }}>
      <Label styles={{ root: { fontWeight: 600, lineHeight: '20px' } }}>Basic Info</Label>
      <Stack styles={{ root: { paddingTop: '10px' } }} tokens={{ childrenGap: 10 }}>
        <HorizontalTextField required label="Name" value={localFormData.name} disabled />
        {localFormData.media_type === 'Camera' ? (
          <Stack tokens={{ childrenGap: 10 }}>
            <HorizontalTextField required label="RTSP URL" value={localFormData.rtsp} disabled />
            <HorizontalTextField
              label="Username"
              value={localFormData.userName}
              onChange={(_, newValue) => onFormDataChange({ ...localFormData, userName: newValue })}
            />
            <HorizontalTextField
              label="Password"
              value={localFormData.password}
              onChange={(_, newValue) => onFormDataChange({ ...localFormData, password: newValue })}
            />
            <Stack horizontal tokens={{ childrenGap: 20 }}>
              <Stack>
                <HorizontalDropdown
                  label="Select compute devices"
                  selectedKeys={localFormData.selectedDeviceList.map((device) => device)}
                  options={computeDeviceList
                    .filter((device) => localFormData.selectedDeviceList.includes(device.symphony_id))
                    .map((device) => ({
                      key: device.symphony_id,
                      text: device.name,
                    }))}
                  required
                  multiSelect
                  disabled
                />
              </Stack>
              {/* <Stack horizontal tokens={{ childrenGap: 8 }}>
                {localFormData.selectedDeviceList.map((device, idx) => (
                  <TagLabel
                    key={idx}
                    id={device.key}
                    text={device.text}
                    onDelete={(id: number) =>
                      onFormDataChange({
                        ...localFormData,
                        selectedDeviceList: localFormData.selectedDeviceList.filter(
                          (device) => +device.key !== id,
                        ),
                      })
                    }
                  />
                ))}
              </Stack> */}
            </Stack>
          </Stack>
        ) : (
          <HorizontalTextField required label="URL" value={localFormData.media_source} disabled />
        )}

        <Stack>
          <HorizontalDropdown
            label="Location"
            selectedKey={localFormData.location}
            options={locationOptions}
            required
            onChange={(_, option: IDropdownOption) =>
              onFormDataChange({ ...localFormData, location: +option.key })
            }
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
