// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useCallback, useMemo } from 'react';
import {
  Stack,
  Text,
  DetailsList,
  IColumn,
  IconButton,
  IContextualMenuProps,
  ICommandBarItemProps,
  CommandBar,
  SelectionMode,
  Selection,
  Icon,
} from '@fluentui/react';
import { clone } from 'ramda';

import {
  CreateDeploymentFormData,
  ConfigureCamera,
  ConfigureSkill,
  UpdateDeploymentFormData,
} from '../types';
import { theme } from '../../../constant';

import ConfigureSidePanel from './ConfigureSidePanel';
import ConfigureSceneSidePanel from './ConfigureSceneSidePanel';

interface Props {
  localFormData: CreateDeploymentFormData | UpdateDeploymentFormData;
  onFormDataChange: (formData: CreateDeploymentFormData | UpdateDeploymentFormData) => void;
}

const Configure = (props: Props) => {
  const { localFormData, onFormDataChange } = props;

  const [isOpenConfigure, setIsOpenConfigure] = useState(false);
  const [isOpenAISkill, setIsOpenAISkill] = useState(false);
  const [localCameraList, setLocalCameraList] = useState<string[]>([]);
  const [localConfigureCascade, setLocalConfigureCascade] = useState<ConfigureSkill | null>(null);

  const selection = useMemo(
    () =>
      new Selection({
        onSelectionChanged: () => {
          const selectedCameraList = selection.getSelection() as { camera: string; string: string }[];

          setLocalCameraList(selectedCameraList.map((c) => c.camera));
        },
        selectionMode: SelectionMode.multiple,
      }),
    [],
  );

  const onConfigureAdd = useCallback(
    (selectedCameras: string[], selectedCascades: { id: number; name: string }[]) => {
      let newCameraList = [] as ConfigureCamera[];

      localFormData.cameraList.forEach((camera) => {
        if (selectedCameras.includes(camera.camera)) {
          const newCamera = {
            ...camera,
            skillList: selectedCascades.map((cascade) => {
              return {
                ...cascade,
                configured: true,
              };
            }),
          };

          newCameraList = [...newCameraList, newCamera];
        } else {
          newCameraList = [...newCameraList, camera];
        }
      });

      onFormDataChange({
        ...localFormData,
        cameraList: newCameraList,
        error: { ...localFormData.error, skillList: '' },
      });
      setIsOpenConfigure(false);
    },
    [onFormDataChange, localFormData],
  );

  const onConfigureCameraDelete = useCallback(() => {
    const newCameraList = localFormData.cameraList.filter(
      (camera) => !localCameraList.includes(camera.camera),
    );

    onFormDataChange({
      ...localFormData,
      cameraList: newCameraList,
      error: { ...localFormData.error, skillList: '' },
    });
  }, [localFormData, localCameraList, onFormDataChange]);

  const onConfigureCascadeDelete = useCallback(
    (camera: string, cascadeId: number) => {
      let newCameraList = [] as ConfigureCamera[];

      localFormData.cameraList.forEach((cam) => {
        if (cam.camera === camera) {
          const newSkillList = clone(cam.skillList).filter((cascade) => cascade.id !== cascadeId);
          newCameraList = [...newCameraList, { ...cam, skillList: newSkillList }];
        } else {
          newCameraList = [...newCameraList, cam];
        }
      });

      onFormDataChange({
        ...localFormData,
        cameraList: newCameraList,
        // error: { ...localFormData.error, skillList: '' },
      });
    },
    [localFormData, onFormDataChange],
  );

  const menuProps: IContextualMenuProps = {
    items: [
      {
        key: 'delete',
        text: 'Remove camera',
        iconProps: { iconName: 'Delete' },
        onClick: () => onConfigureCameraDelete(),
      },
    ],
  };

  const commandBarItems: ICommandBarItemProps[] = useMemo(
    () => [
      {
        key: 'add',
        text: 'Add AI Skills',
        iconProps: {
          iconName: 'Add',
        },
        onClick: () => setIsOpenConfigure(true),
        disabled: localCameraList.length === 0,
      },
      {
        key: 'delete',
        text: 'Delete',
        iconProps: { iconName: 'Delete' },
        onClick: () => onConfigureCameraDelete(),
        disabled: localCameraList.length === 0,
      },
    ],
    [localCameraList.length, onConfigureCameraDelete],
  );

  const columns: IColumn[] = [
    {
      key: 'camera',
      minWidth: 150,
      maxWidth: 150,
      name: 'Camera',
      fieldName: 'name',
      onRender: (item: ConfigureCamera) => (
        <Text styles={{ root: { color: theme.palette.themeSecondary, textDecoration: 'underline' } }}>
          {item.name}
        </Text>
      ),
    },
    {
      key: 'configure',
      minWidth: 250,
      maxWidth: 250,
      name: 'AI Skills',
      fieldName: '',
      onRender: (item: ConfigureCamera) => (
        <Stack tokens={{ childrenGap: 15 }}>
          {item.skillList.length === 0 ? (
            <Text>-</Text>
          ) : (
            item.skillList.map((cascade) => (
              <Stack key={cascade.id} tokens={{ childrenGap: 15 }} horizontal verticalAlign="center">
                <Text>{cascade.name}</Text>
                <Icon
                  iconName="Delete"
                  styles={{
                    root: { color: theme.palette.themeSecondary, fontSize: '16px', cursor: 'pointer' },
                  }}
                  onClick={() => onConfigureCascadeDelete(item.camera, cascade.id)}
                />
              </Stack>
            ))
          )}
        </Stack>
      ),
    },
    {
      key: 'status',
      minWidth: 250,
      maxWidth: 250,
      name: 'Status',
      fieldName: '',
      onRender: (item: ConfigureCamera) => (
        <Stack tokens={{ childrenGap: 15 }}>
          {item.skillList.map((cascade) => (
            <Stack key={cascade.id} tokens={{ childrenGap: 5 }} horizontal verticalAlign="center">
              <Icon iconName="SkypeCircleCheck" styles={{ root: { color: '#57A300', fontSize: '16px' } }} />
              <Text
              // onClick={() => {
              //   setIsOpenAISkill(true);
              //   setLocalConfigureCascade(cascade);
              // }}
              >
                {cascade.configured ? 'Configured' : 'Configured'}
              </Text>
            </Stack>
          ))}
        </Stack>
      ),
    },
    {
      key: 'button',
      minWidth: 550,
      maxWidth: 550,
      name: '',
      fieldName: '',
      onRender: () => <IconButton menuIconProps={{ iconName: 'More' }} menuProps={menuProps} />,
    },
  ];

  return (
    <>
      <Stack styles={{ root: { paddingTop: '25px' } }}>
        <CommandBar items={commandBarItems} styles={{ root: { paddingLeft: 0 } }} />
        <Text styles={{ root: { paddingTop: '25px' } }}>
          Link your cameras to AI skill by selecting your cameras below and clicking ‘Add AI Skills’ above.
          Each camera must have a skill configured in order to progress.
        </Text>
        <DetailsList columns={columns} items={localFormData.cameraList} selection={selection} />
      </Stack>
      {isOpenConfigure && (
        <ConfigureSidePanel
          deivceId={localFormData.device.key}
          onPanelClose={() => setIsOpenConfigure(false)}
          selectedCameras={localCameraList}
          onConfigureAdd={onConfigureAdd}
        />
      )}
      {isOpenAISkill && !!localConfigureCascade && (
        <ConfigureSceneSidePanel
          configureCascade={localConfigureCascade}
          onPanelClose={() => {
            setIsOpenAISkill(false);
            setLocalConfigureCascade(null);
          }}
        />
      )}
    </>
  );
};

export default Configure;
