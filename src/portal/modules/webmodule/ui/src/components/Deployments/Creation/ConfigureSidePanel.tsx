// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useState } from 'react';
import { Panel, Stack, PrimaryButton, DefaultButton, IDropdownOption, Text } from '@fluentui/react';
import { useSelector } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { selectAllCameras } from '../../../store/cameraSlice';
import { theme } from '../../../constant';
import { matchDeviceAccelerationSelectorFactory } from '../../../store/selectors';

import SidePanelDropdown from '../../Common/SidePanel/SidePanelDropdown';
import TagLabel from '../../Common/TagLabel';

interface Props {
  deivceId: number;
  selectedCameras: string[];
  onPanelClose: () => void;
  onConfigureAdd: (cameras: string[], cascade: { id: number; name: string }[]) => void;
}

const ConfigureSidePanel = (props: Props) => {
  const { onPanelClose, selectedCameras, onConfigureAdd, deivceId } = props;

  const [localCascadeList, setLocalCascadeList] = useState<{ id: number; name: string }[]>([]);

  const cameraList = useSelector((state: RootState) => selectAllCameras(state));
  const matchedAiSkillList = useSelector(matchDeviceAccelerationSelectorFactory(deivceId));

  const cascadeListOptions: IDropdownOption[] = matchedAiSkillList.map((cascade) => ({
    key: cascade.id,
    text: cascade.name,
  }));

  const onSkillChange = useCallback((option: IDropdownOption) => {
    if (option.selected) {
      setLocalCascadeList((prev) => [...prev, { id: +option.key as number, name: option.text }]);
    } else {
      setLocalCascadeList((prev) => prev.filter((cascade) => cascade.id !== +option.key));
    }
  }, []);

  const onRenderFooterContent = useCallback(
    () => (
      <Stack tokens={{ childrenGap: 5 }} horizontal>
        <PrimaryButton onClick={() => onConfigureAdd(selectedCameras, localCascadeList)}>Add</PrimaryButton>
        <DefaultButton onClick={onPanelClose}>Cancel</DefaultButton>
      </Stack>
    ),
    [onConfigureAdd, selectedCameras, localCascadeList, onPanelClose],
  );

  return (
    <Panel
      isOpen={true}
      onDismiss={onPanelClose}
      hasCloseButton
      headerText="Configure AI Skills"
      onRenderFooterContent={onRenderFooterContent}
      isFooterAtBottom={true}
    >
      <Stack styles={{ root: { paddingTop: '25px' } }} tokens={{ childrenGap: 20 }}>
        <Stack>
          <Text styles={{ root: { color: theme.palette.neutralSecondaryAlt, paddingBottom: '5px' } }}>
            Cameras
          </Text>
          {selectedCameras.map((symphonyId) => {
            const selectedCamera = cameraList.find((camera) => camera.symphony_id === symphonyId);

            return <Text key={symphonyId}>{selectedCamera.name}</Text>;
          })}
        </Stack>
        {/* <SidePanelDropdown
          label="Cameras"
          options={cameraListOptions}
          multiSelect
          selectedKeys={cameraIdList}
          onChange={(_, option: IDropdownOption) => onCameraChange(option)}
        /> */}
        <SidePanelDropdown
          label="AI Skills (greyed-out skills are incompatible
            with your device)"
          options={cascadeListOptions}
          multiSelect
          selectedKeys={localCascadeList.map((cascade) => cascade.id)}
          onChange={(_, option: IDropdownOption) => onSkillChange(option)}
          styles={{ dropdown: { width: '200px' } }}
        />
        <Stack horizontal tokens={{ childrenGap: 7 }} styles={{ root: { flexWrap: 'wrap' } }}>
          {localCascadeList.map((cascade, idx) => (
            <TagLabel key={idx} id={cascade.id} text={cascade.name} onDelete={(id) => null} />
          ))}
        </Stack>
      </Stack>
    </Panel>
  );
};

export default ConfigureSidePanel;
