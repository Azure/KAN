import React, { useCallback, useState } from 'react';
import { Panel, Stack, PrimaryButton, DefaultButton, IDropdownOption, Link } from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';
import { clone } from 'ramda';

import { State as RootState } from 'RootStateType';
import { Camera, deleteCameras, updateCamera, selectAllCameras } from '../../store/cameraSlice';
import { selectAllLocations } from '../../store/locationSlice';

import SidePanelLabel from '../Common/SidePanel/SidePanelLabel';
import SidePanelTextField from '../Common/SidePanel/SidePanelTextField';
import SidePanelDropdown from '../Common/SidePanel/SidePanelDropdown';
import SidePanelTag from '../Common/SidePanel/SidePanelTag';

interface Props {
  onPanelClose: () => void;
  camera: Camera;
}

type FormData = {
  name: string;
  location: number;
  error: {
    name: string | null;
  };
};

const isUpdateDisable = (formData: FormData) => Object.values(formData.error).some((e) => !!e);

const CameraSidePanel = (props: Props) => {
  const { onPanelClose, camera } = props;
  const locationList = useSelector((state: RootState) => selectAllLocations(state));
  const cameraList = useSelector((state: RootState) => selectAllCameras(state));

  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localFormData, setLocalFormData] = useState<FormData>({
    name: camera.name,
    location: camera.location,
    error: {
      name: null,
    },
  });
  const [localTagList, setLocalTagList] = useState<{ name: string; value: string }[]>([]);

  const dispatch = useDispatch();
  const existingCameraNameList = cameraList
    .filter((c) => c.name !== camera.name)
    .map((camera) => camera.name);

  const locationOptions: IDropdownOption[] = locationList.map((l) => ({
    key: l.id,
    text: l.name,
  }));

  const onFormDateValidate = useCallback(() => {
    if (localFormData.name === '') {
      setLocalFormData((prev) => ({ ...prev, error: { ...prev.error, name: 'Name cannot be blank' } }));
      return true;
    }

    if (existingCameraNameList.includes(localFormData.name)) {
      setLocalFormData((prev) => ({ ...prev, error: { ...prev.error, name: 'Name is already used' } }));
      return true;
    }
  }, [existingCameraNameList, localFormData]);

  const onTaskDelete = useCallback(async () => {
    setIsLoading(true);

    await dispatch(deleteCameras([camera.id]));
    onPanelClose();
  }, [dispatch, camera, onPanelClose]);

  const onEditedTaskSave = useCallback(async () => {
    if (onFormDateValidate()) return;

    setIsLoading(true);
    await dispatch(updateCamera({ id: camera.id, body: { ...localFormData } }));

    onPanelClose();
  }, [localFormData, onPanelClose, camera, dispatch, onFormDateValidate]);

  const onRenderFooterContent = useCallback(
    () => (
      <Stack tokens={{ childrenGap: 5 }} horizontal>
        <PrimaryButton
          onClick={() => (isEdit ? onEditedTaskSave() : setIsEdit(true))}
          disabled={isLoading || isUpdateDisable(localFormData)}
        >
          {isEdit ? 'Save and Close' : 'Edit'}
        </PrimaryButton>
        <DefaultButton iconProps={{ iconName: 'Delete Camera' }} onClick={onTaskDelete} disabled={isLoading}>
          Delete
        </DefaultButton>
      </Stack>
    ),
    [onTaskDelete, onEditedTaskSave, isLoading, isEdit, localFormData],
  );

  return (
    <Panel
      isOpen={true}
      onDismiss={onPanelClose}
      hasCloseButton
      headerText="Edit camera"
      onRenderFooterContent={onRenderFooterContent}
      isFooterAtBottom={true}
    >
      <Stack styles={{ root: { paddingTop: '25px' } }} tokens={{ childrenGap: 15 }}>
        {isEdit ? (
          <SidePanelTextField
            label="Camera name"
            value={localFormData.name}
            onChange={(_, newValue: string) =>
              setLocalFormData((prev) => ({
                ...prev,
                name: newValue,
                error: { name: '' },
              }))
            }
            required
            errorMessage={localFormData.error.name}
          />
        ) : (
          <SidePanelLabel title="Camera name" content={localFormData.name} />
        )}
        <SidePanelLabel title="Camera or Video?" content={camera.media_type} />
        <SidePanelLabel title="RTSP URL" content={camera.rtsp} />
        {isEdit ? (
          <SidePanelDropdown
            label="Location"
            selectedKey={localFormData.location}
            options={locationOptions}
            onChange={(_, option?: IDropdownOption) => {
              console.log('+option.key', +option.key);

              setLocalFormData((prev) => ({ ...prev, location: +option.key }));
            }}
            required
          />
        ) : (
          <SidePanelLabel title="Camera name" content={localFormData.name} />
        )}
        <SidePanelTag
          isEdit={isEdit}
          tagList={localTagList}
          onTagListChange={(newTag) => setLocalTagList(newTag)}
          onDelete={(idx: number) =>
            setLocalTagList((prev) => {
              const newTagList = clone(prev);
              newTagList.splice(idx, 1);

              return newTagList;
            })
          }
        />
        <Link onClick={() => onPanelClose()}>View Connected Cameras</Link>
        <Link>View Active Deployments</Link>
      </Stack>
    </Panel>
  );
};

export default CameraSidePanel;
