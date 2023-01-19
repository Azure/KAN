// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useState, useEffect } from 'react';
import { useHistory, generatePath, Route, Switch, useParams } from 'react-router-dom';
import { Pivot, PivotItem, Spinner, Stack, IPivotItemProps } from '@fluentui/react';
import { clone } from 'ramda';
import { useSelector } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { Url } from '../../constant';
import { UpdateCameraFormData, PivotTabKey } from './types';
import { selectCameraById } from '../../store/cameraSlice';
import { getScrllStackClasses } from '../Common/styles';

import Basics from './Edit/Basics';
import Preview from './Create/Preview';
import EditFooter from './Edit/EditFooter';
import TagTab, { Tag, getErrorMessage } from '../Common/TagTab';
import ErrorIcon from '../Common/ErrorIcon';

const CameraCreate = () => {
  const { id, step } = useParams<{ id: string; step: PivotTabKey }>();

  const history = useHistory();
  const scrollClasses = getScrllStackClasses();

  const camera = useSelector((state: RootState) => selectCameraById(state, id));
  const [isUpdating, setIsUpdating] = useState(false);
  const [localFormData, setLocalFormData] = useState<UpdateCameraFormData>({
    name: '',
    media_type: 'Camera',
    videoType: 'link',
    location: '',
    rtsp: '',
    media_source: '',
    tag_list: [{ name: '', value: '', errorMessage: '' }],
    selectedDeviceList: [],
    userName: '',
    password: '',
  });
  const [localPivotKey, setLocalPivotKey] = useState<PivotTabKey>(step);

  console.log('localFormData', localFormData);

  useEffect(() => {
    if (!camera) return;

    setLocalFormData({
      name: camera.name,
      media_type: 'Camera',
      videoType: 'link',
      location: camera.location,
      rtsp: camera.rtsp,
      media_source: '',
      userName: camera.username,
      password: camera.password,
      selectedDeviceList: camera.allowed_devices,
      tag_list: [
        ...camera.tag_list.map((tag) => ({ ...tag, errorMessage: '' })),
        { name: '', value: '', errorMessage: '' },
      ],
    });
  }, [camera]);

  const onLinkClick = useCallback(
    (key: PivotTabKey) => {
      setLocalPivotKey(key);

      history.push(
        generatePath(Url.CAMERAS_EDIT, {
          step: key,
          id: camera.id,
        }),
      );
    },
    [history, camera],
  );

  const onFormDateValidate = useCallback(
    (currentStep: PivotTabKey) => {
      if (currentStep === 'basics') return false;

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

  const onFormDataChange = useCallback((newFormData: UpdateCameraFormData) => {
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

  return (
    <>
      <Stack horizontal verticalAlign="center">
        <Pivot
          styles={{ itemContainer: { height: 'calc(100% - 44px)' } }}
          onLinkClick={(item) => onLinkClick(item?.props.itemKey as PivotTabKey)}
          selectedKey={localPivotKey}
        >
          <PivotItem headerText="Basics" itemKey="basics" />
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
        {isUpdating && <Spinner size={3} />}
      </Stack>
      <Stack className={scrollClasses.root}>
        <Switch>
          <Route
            exact
            path={Url.CAMERAS_EDIT_PREVIEW}
            render={() => <Preview localFormData={localFormData} onLinkClick={onLinkClick} />}
          />
          <Route
            exact
            path={Url.CAMERAS_EDIT_TAG}
            render={() => (
              <TagTab tagList={localFormData.tag_list} onTagChange={onTagChange} onTagDelete={onTagDelete} />
            )}
          />
          <Route
            exact
            path={Url.CAMERAS_EDIT_BASICS}
            render={() => <Basics localFormData={localFormData} onFormDataChange={onFormDataChange} />}
          />
        </Switch>
      </Stack>
      <EditFooter
        cameraId={camera.id}
        kan_id={camera.kan_id}
        currentStep={localPivotKey}
        onLinkClick={onLinkClick}
        localFormData={localFormData}
        isUpdating={isUpdating}
        onUpdating={() => setIsUpdating(true)}
        stepList={['basics', 'tag', 'preview']}
        onFormDateValidate={onFormDateValidate}
      />
    </>
  );
};

export default CameraCreate;
