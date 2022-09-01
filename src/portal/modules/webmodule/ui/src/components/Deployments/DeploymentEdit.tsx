// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useHistory, generatePath, Route, Switch } from 'react-router-dom';
import { Stack, Pivot, PivotItem, IPivotItemProps } from '@fluentui/react';
import { clone } from 'ramda';

import { State as RootState } from 'RootStateType';
import { Url } from '../../constant';
import { selectDeploymentById } from '../../store/deploymentSlice';
import { selectAllComputeDevices } from '../../store/computeDeviceSlice';
import { selectAllCameras } from '../../store/cameraSlice';
import { selectAllCascades } from '../../store/cascadeSlice';
import { UpdateDeploymentFormData, PivotTabKey } from './types';
import { getDeploymentWrapperClasses } from './styles';

import Basics from './Edit/Basics';
import Configure from './Creation/Configure';
import TagTab, { Tag, getErrorMessage } from '../Common/TagTab';
import Preview from './Creation/Preview';
import EditFooter from './Edit/EditFooter';
import ErrorIcon from '../Common/ErrorIcon';

const DeploymentEdit = () => {
  const { id, key } = useParams<{ id: string; key: PivotTabKey }>();

  const history = useHistory();
  const classes = getDeploymentWrapperClasses();

  const deployment = useSelector((state: RootState) => selectDeploymentById(state, id));
  const deviceList = useSelector((state: RootState) => selectAllComputeDevices(state));
  const cameraList = useSelector((state: RootState) => selectAllCameras(state));
  const skillList = useSelector((state: RootState) => selectAllCascades(state));

  const [localFormData, setLocalFormData] = useState<UpdateDeploymentFormData>({
    name: '',
    cameraList: [],
    device: { key: -1, text: '', data: '' },
    tag_list: [{ name: '', value: '', errorMessage: '' }],
    error: {
      cameraList: '',
      skillList: '',
    },
  });
  const [localPivotKey, setLocalPivotKey] = useState<PivotTabKey>(key);

  useEffect(() => {
    if (!deployment || !cameraList.length || !deviceList.length || !skillList.length) return;

    const matchedDevice = deviceList.find((device) => device.id === deployment.compute_device);
    const cameraMap = cameraList.reduce((accMap, camera) => {
      if (!accMap[camera.id]) return { ...accMap, [camera.id]: camera.name };
      return { ...accMap };
    }, {});
    const skillMap = skillList.reduce((accMap, skill) => {
      if (!accMap[skill.id]) return { ...accMap, [skill.id]: skill.name };
      return { ...accMap };
    }, {});

    setLocalFormData({
      name: deployment.name,
      device: { key: matchedDevice.id, text: matchedDevice.name, data: matchedDevice.symphony_id },
      cameraList: deployment.configure.map((configureCamera) => {
        return {
          camera: configureCamera.camera,
          name: cameraMap[configureCamera.camera],
          skillList: configureCamera.skills.map((skill) => ({ ...skill, name: skillMap[skill.id] })),
        };
      }),
      tag_list: [
        ...deployment.tag_list.map((tag) => ({ ...tag, errorMessage: '' })),
        { name: '', value: '', errorMessage: '' },
      ],
      error: {
        cameraList: '',
        skillList: '',
      },
    });
  }, [deployment, deviceList, cameraList, skillList]);

  const onLinkClick = useCallback(
    (key: PivotTabKey) => {
      setLocalPivotKey(key);

      history.push(
        generatePath(Url.DEPLOYMENT_EDIT, {
          id,
          key,
        }),
      );
    },
    [history, id],
  );

  const onFormDataChange = useCallback((newFormData: UpdateDeploymentFormData) => {
    setLocalFormData({ ...newFormData });
  }, []);

  const onTagChange = useCallback(
    (idx: number, newTag: Tag) => {
      const newTagList = clone(localFormData.tag_list);

      const dupNameList = newTagList.map((tag) => tag.name);
      dupNameList.splice(idx, 1);

      newTagList.splice(idx, 1, { ...newTag, errorMessage: getErrorMessage(newTag, dupNameList) });

      if (localFormData.tag_list.length - 1 === idx)
        newTagList.push({ name: '', value: '', errorMessage: '' });

      setLocalFormData((prev) => ({ ...prev, tag_list: newTagList }));
    },
    [localFormData.tag_list],
  );

  const onTagDelete = useCallback(
    (idx: number) => {
      setLocalFormData((prev) => {
        const newTagList = clone(localFormData.tag_list);
        newTagList.splice(idx, 1);

        return { ...prev, tag_list: newTagList };
      });
    },
    [localFormData.tag_list],
  );

  const onFormDateValidate = useCallback(
    (currentStep: PivotTabKey) => {
      if (localFormData.cameraList.length === 0) {
        setLocalFormData((prev) => ({
          ...prev,
          error: { ...prev.error, cameraList: 'Value cannot be blank.' },
        }));
        return true;
      }

      if (currentStep === 'basics') return false;

      if (
        localFormData.cameraList.length > 0 &&
        localFormData.cameraList.some((camera) => camera.skillList.length === 0)
      ) {
        setLocalFormData((prev) => ({
          ...prev,
          error: { ...prev.error, skillList: 'Value cannot be blank.' },
        }));
        return true;
      }

      if (
        localFormData.tag_list.length > 1 &&
        localFormData.tag_list.some((tag) => tag.errorMessage !== '')
      ) {
        return true;
      }

      return false;
    },
    [localFormData],
  );

  return (
    <>
      <Stack styles={{ root: classes.root }}>
        <Stack horizontal verticalAlign="center">
          <Pivot
            styles={{ itemContainer: { height: 'calc(100% - 44px)' } }}
            onLinkClick={(item) => onLinkClick(item?.props.itemKey! as PivotTabKey)}
            selectedKey={localPivotKey}
          >
            <PivotItem headerText="Basics" itemKey="basics" />
            <PivotItem
              headerText="Configure AI Skills"
              itemKey="configure"
              onRenderItemLink={(item: IPivotItemProps) => (
                <Stack horizontal>
                  {localFormData.error.skillList !== '' && <ErrorIcon />}
                  {item.headerText}
                </Stack>
              )}
            />
            <PivotItem
              headerText="Tags (Optional)"
              itemKey="tag"
              onRenderItemLink={(item: IPivotItemProps) => (
                <Stack horizontal>
                  {localFormData.tag_list.length > 1 &&
                    localFormData.tag_list.some((tag) => tag.errorMessage !== '') && <ErrorIcon />}
                  {item.headerText}
                </Stack>
              )}
            />
            <PivotItem
              headerText="Review + Update"
              itemKey="preview"
              style={{ height: '100%', position: 'relative' }}
            />
          </Pivot>
        </Stack>
        <Switch>
          <Route
            exact
            path={Url.DEPLOYMENT_EDIT_PREVIEW}
            render={() => <Preview localFormData={localFormData} onLinkClick={onLinkClick} />}
          />
          <Route
            exact
            path={Url.DEPLOYMENT_EDIT_TAG}
            render={() => (
              <TagTab tagList={localFormData.tag_list} onTagChange={onTagChange} onTagDelete={onTagDelete} />
            )}
          />
          <Route
            exact
            path={Url.DEPLOYMENT_EDIT_CONFIGURE}
            render={() => <Configure localFormData={localFormData} onFormDataChange={onFormDataChange} />}
          />
          <Route
            exact
            path={Url.DEPLOYMENT_EDIT_BASIC}
            render={() => <Basics localFormData={localFormData} />}
          />
        </Switch>
      </Stack>
      <EditFooter
        deploymentId={id}
        currentStep={localPivotKey}
        onLinkClick={onLinkClick}
        localFormData={localFormData}
        // isCreating={isCreating}
        // onIsCreatingChange={() => setIsCreating(true)}
        stepList={['basics', 'configure', 'tag', 'preview']}
        onFormDateValidate={onFormDateValidate}
      />
    </>
  );
};

export default DeploymentEdit;
