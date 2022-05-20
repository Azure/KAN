import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  Stack,
  Text,
  Label,
  IChoiceGroupOption,
  ChoiceGroup,
  Link,
  DefaultButton,
  IDropdownOption,
} from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { State as RootState } from 'RootStateType';
import { postLocation, selectAllLocations } from '../../../store/locationSlice';
import { selectAllComputeDevices } from '../../../store/computeDeviceSlice';
import { MediaType, VideoType, CreateCameraFormData } from '../types';
import { CreateByNameDialog } from '../../CreateByNameDialog';
import { theme, Url } from '../../../constant';

import TagLabel from '../../Common/TagLabel';
import HorizontalDropdown from '../../Common/HorizontalDropdown';
import HorizontalTextField from '../../Common/HorizontalTextField';

interface Props {
  localFormData: CreateCameraFormData;
  onFormDataChange: (formData: CreateCameraFormData) => void;
}

const getSelectedDeviceIds = (deviceList: { key: number; text: string }[], option: IDropdownOption) => {
  if (option.selected) {
    return [...deviceList, { key: +option.key, text: option.text }];
  } else {
    return deviceList.filter((device) => device.key !== option.key);
  }
};

const Basics = (props: Props) => {
  const { localFormData, onFormDataChange } = props;

  const [dialogHidden, setDialogHidden] = useState(true);
  const fileInputRef = useRef(null);

  const dispatch = useDispatch();
  const history = useHistory();

  const locationList = useSelector((state: RootState) => selectAllLocations(state));
  const computeDeviceList = useSelector((state: RootState) => selectAllComputeDevices(state));

  const mediaOptions: IChoiceGroupOption[] = [
    { key: 'Camera', text: 'Cameras' },
    { key: 'Video', text: 'Videos' },
  ];

  const videoOptions: IChoiceGroupOption[] = [
    { key: 'upload', text: 'Upload video' },
    { key: 'link', text: 'Link' },
  ];

  const locationOptions = useMemo(
    () =>
      locationList.map((l) => ({
        key: l.id,
        text: l.name,
      })),
    [locationList],
  );

  const deviceOptions = useMemo(
    () =>
      computeDeviceList.map((device) => ({
        key: device.id,
        text: device.name,
      })),
    [computeDeviceList],
  );

  const onFromDataChange = useCallback(
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

      onFormDataChange({ ...localFormData, location: res.payload.id });
    },
    [dispatch, localFormData, onFormDataChange],
  );

  const onFileInputUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    for (let i = 0; i < e.target.files.length; i++) {
      const formData = new FormData();
      formData.append('image', e.target.files[i]);
      // dispatch(postImages(formData));
    }
  }, []);

  return (
    <Stack styles={{ root: { paddingTop: '40px' } }}>
      <Label styles={{ root: { fontWeight: 600, lineHeight: '20px' } }}>Basic Info</Label>
      <Stack styles={{ root: { paddingTop: '10px' } }} tokens={{ childrenGap: 10 }}>
        <HorizontalTextField
          required
          label="Name"
          value={localFormData.name}
          onChange={(_, newValue) => onFromDataChange('name', newValue)}
          errorMessage={localFormData.error.name}
        />
        <ChoiceGroup
          selectedKey={localFormData.media_type}
          options={mediaOptions}
          onChange={(_, option?: IChoiceGroupOption) =>
            onFormDataChange({ ...localFormData, media_type: option.key as MediaType })
          }
          label="Use cameras or videos"
          required={true}
          styles={{ root: { display: 'flex' }, label: { width: '200px', fontWeight: 400 } }}
        />

        {localFormData.media_type === 'Video' && (
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
        )}
        {localFormData.media_type === 'Camera' ? (
          <Stack tokens={{ childrenGap: 10 }}>
            <HorizontalTextField
              required
              label="RTSP URL"
              value={localFormData.rtsp}
              onChange={(_, newValue) => onFromDataChange('rtsp', newValue)}
              errorMessage={localFormData.error.rtsp}
            />
            <HorizontalTextField
              label="Username"
              value={localFormData.userName}
              onChange={(_, newValue) => onFromDataChange('userName', newValue)}
            />
            <HorizontalTextField
              label="Password"
              value={localFormData.password}
              onChange={(_, newValue) => onFromDataChange('password', newValue)}
            />
            {/* <Stack horizontal tokens={{ childrenGap: 20 }}>
              <Stack>
                <HorizontalDropdown
                  label="Select compute devices"
                  selectedKeys={localFormData.selectedDeviceList.map((device) => device.key)}
                  options={deviceOptions}
                  onChange={(_, option) =>
                    onFormDataChange({
                      ...localFormData,
                      selectedDeviceList: getSelectedDeviceIds(localFormData.selectedDeviceList, option),
                    })
                  }
                  styles={{
                    dropdown: { width: '200px' },
                  }}
                  required
                  multiSelect
                />
                {!computeDeviceList.length && (
                  <Link
                    styles={{
                      root: { paddingLeft: '200px', fontSize: '13px', lineHeight: '18px', width: '100%' },
                    }}
                    onClick={() => history.push(Url.COMPUTE_DEVICE)}
                  >
                    Create one
                  </Link>
                )}
              </Stack>
              <Stack horizontal tokens={{ childrenGap: 8 }}>
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
              </Stack>
            </Stack> */}
          </Stack>
        ) : (
          <>
            {localFormData.videoType === 'upload' ? (
              <Stack horizontal>
                <Label
                  styles={{
                    root: {
                      width: 200,
                      color: theme.palette.neutralPrimary,
                      fontWeight: 400,
                    },
                  }}
                  required
                >
                  Video File
                </Label>
                <Stack tokens={{ childrenGap: '5px' }} horizontal verticalAlign="end">
                  <DefaultButton text="Upload" iconProps={{ iconName: 'Upload' }} />
                  <Text styles={{ root: { fontSize: '13px' } }}>Max: X MB</Text>
                </Stack>
              </Stack>
            ) : (
              <HorizontalTextField
                required
                label="URL"
                value={localFormData.media_source}
                onChange={(_, newValue) => onFromDataChange('media_source', newValue)}
                errorMessage={localFormData.error.mediaSource}
              />
            )}
          </>
        )}

        <Stack>
          <HorizontalDropdown
            label="Location"
            selectedKey={localFormData.location}
            options={locationOptions}
            onChange={(_, option) =>
              onFormDataChange({
                ...localFormData,
                location: +option.key,
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
      <input ref={fileInputRef} type="file" onChange={onFileInputUpload} style={{ display: 'none' }} />
    </Stack>
  );
};

export default Basics;
