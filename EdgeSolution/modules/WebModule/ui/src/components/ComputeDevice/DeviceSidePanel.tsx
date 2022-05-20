import React, { useCallback, useState } from 'react';
import { Panel, Stack, PrimaryButton, DefaultButton, IDropdownOption, Link } from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { clone } from 'ramda';

import { State as RootState } from 'RootStateType';
import { ComputeDevice } from '../../store/types';
import { deleteComputeDevice, selectAllComputeDevices } from '../../store/computeDeviceSlice';
import { Url } from '../../constant';
import { UpdateComputeDeviceFromData, CPUArchitecture, accelerationOptions } from './types';

import SidePanelLabel from '../Common/SidePanel/SidePanelLabel';
import SidePanelTag from '../Common/SidePanel/SidePanelTag';
import SideTextField from '../Common/SidePanel/SidePanelTextField';
import SIdePanelDropdown from '../Common/SidePanel/SidePanelDropdown';

interface Props {
  onPanelClose: () => void;
  device: ComputeDevice;
}

const DeviceSidePanel = (props: Props) => {
  const { onPanelClose, device } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [localFormData, setLocalFormData] = useState<UpdateComputeDeviceFromData>({
    name: device.name,
    architecture: device.architecture as CPUArchitecture,
    acceleration: device.acceleration,
    tag_list: device.tag_list,
    error: {
      name: null,
    },
  });

  const deviceList = useSelector((state: RootState) => selectAllComputeDevices(state));
  const dispatch = useDispatch();
  const history = useHistory();
  const existingNameList = deviceList.reduce((nameAry, d) => {
    if (d.name === device.name) return nameAry;
    return [...nameAry, d.name];
  }, []);

  const cpuArchitectureOptions: IDropdownOption[] = [
    {
      key: 'X64',
      text: 'X64',
    },
    {
      key: 'ARM64',
      text: 'ARM64',
    },
  ];

  const onDeviceDelete = useCallback(async () => {
    await dispatch(deleteComputeDevice([device.id]));
    onPanelClose();
  }, [dispatch, device, onPanelClose]);

  const onNameChange = useCallback(
    (newValue: string) => {
      setLocalFormData((prev) => ({
        ...prev,
        name: newValue,
      }));
    },
    [existingNameList],
  );

  const onRenderFooterContent = useCallback(
    () => (
      <Stack tokens={{ childrenGap: 5 }} horizontal>
        <PrimaryButton onClick={() => (isEdit ? {} : setIsEdit(true))}>
          {isEdit ? 'Save and Close' : 'Edit'}
        </PrimaryButton>
        <DefaultButton
          iconProps={{ iconName: 'Delete device' }}
          disabled={isLoading}
          onClick={onDeviceDelete}
        >
          Delete
        </DefaultButton>
      </Stack>
    ),
    [isLoading, onDeviceDelete, isEdit],
  );

  return (
    <Panel
      isOpen={true}
      onDismiss={onPanelClose}
      hasCloseButton
      headerText="Edit compute device"
      onRenderFooterContent={onRenderFooterContent}
      isFooterAtBottom={true}
    >
      <Stack styles={{ root: { paddingTop: '25px' } }} tokens={{ childrenGap: 15 }}>
        {isEdit ? (
          <SideTextField
            label="Device Name"
            value={localFormData.name}
            onChange={(_, newValue: string) => onNameChange(newValue)}
            required
            errorMessage={localFormData.error.name}
          />
        ) : (
          <SidePanelLabel title="Device Name" content={localFormData.name} />
        )}
        <SidePanelLabel title="IoT Hub Account" content={device.iotHub} />
        <SidePanelLabel title="IoT Edge Device" content={device.iotedge_device} />
        {isEdit ? (
          <SIdePanelDropdown
            label="CPU Architecture"
            selectedKey={localFormData.architecture}
            options={cpuArchitectureOptions}
            onChange={(_, option?: IDropdownOption) => {
              setLocalFormData((prev) => ({ ...prev, cpuArchitecture: option.key as CPUArchitecture }));
            }}
            required
          />
        ) : (
          <SidePanelLabel title="CPU Architecture" content={localFormData.architecture} />
        )}
        {isEdit ? (
          <SIdePanelDropdown
            label="Acceleration"
            selectedKey={localFormData.acceleration}
            options={accelerationOptions}
            onChange={(_, option?: IDropdownOption) => {
              setLocalFormData((prev) => ({ ...prev, acceleration: option.key as string }));
            }}
            required
          />
        ) : (
          <SidePanelLabel title="Acceleration" content={localFormData.acceleration} />
        )}
        <SidePanelTag
          isEdit={isEdit}
          tagList={localFormData.tag_list}
          onTagListChange={(tagList) => setLocalFormData((prev) => ({ ...prev, tagList }))}
          onDelete={(idx: number) =>
            setLocalFormData((prev) => {
              const newTagList = clone(prev.tag_list);
              newTagList.splice(idx, 1);

              return {
                ...prev,
                tagList: newTagList,
              };
            })
          }
        />
        <Link onClick={() => history.push(Url.CAMERAS2)}>View Connected Cameras</Link>
        <Link>View Active Deployments</Link>
      </Stack>
    </Panel>
  );
};

export default DeviceSidePanel;
