// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useState } from 'react';
import { useHistory, generatePath, useLocation, Route, Switch } from 'react-router-dom';
import { Pivot, PivotItem, Spinner, Stack, IPivotItemProps } from '@fluentui/react';
import { clone } from 'ramda';

import { Url, ERROR_BLANK_VALUE, ERROR_NAME_BLANK, ERROR_NAME_BE_USED } from '../../constant';
import { CreateCameraFormData, PivotTabKey } from './types';

import Basics from './Create/Basics';
import Preview from './Create/Preview';
import Footer from './Create/CreateFooter';
import TagTab, { Tag, getErrorMessage } from '../Common/TagTab';
import ErrorIcon from '../Common/ErrorIcon';

export const ERROR_CAMERA_INVALID_RTSP = 'Please provide a valid RTSP link.';
export const ERROR_CAMERA_INVALID_VIDEO = 'Please provide a valid link to download video.';

interface Props {
  existingNameList: string[];
}

const CameraCreate = (props: Props) => {
  const { existingNameList } = props;

  const location = useLocation();
  const history = useHistory();

  const [isCreating, setIsCreating] = useState(false);
  const [localFormData, setLocalFormData] = useState<CreateCameraFormData>({
    name: '',
    media_type: 'Camera',
    videoType: 'link',
    location: -1,
    rtsp: '',
    media_source: '',
    tag_list: [{ name: '', value: '', errorMessage: '' }],
    selectedDeviceList: [],
    userName: '',
    password: '',
    error: {
      name: '',
      rtsp: '',
      mediaSource: '',
      selectedDeviceList: '',
      location: '',
    },
  });

  const [localPivotKey, setLocalPivotKey] = useState<PivotTabKey>(
    location.pathname.split('/')[3] as PivotTabKey,
  );

  const onLinkClick = useCallback(
    (key: PivotTabKey) => {
      setLocalPivotKey(key);

      history.push(
        generatePath(Url.CAMERAS_CREATION, {
          step: key,
        }),
      );
    },
    [history],
  );

  const onFormDateValidate = useCallback(
    (currentStep: PivotTabKey) => {
      if (localFormData.name === '') {
        setLocalFormData((prev) => ({ ...prev, error: { ...prev.error, name: ERROR_NAME_BLANK } }));
        return true;
      }
      if (existingNameList.includes(localFormData.name)) {
        setLocalFormData((prev) => ({ ...prev, error: { ...prev.error, name: ERROR_NAME_BE_USED } }));
        return true;
      }
      if (localFormData.media_type === 'Camera' && localFormData.rtsp === '') {
        setLocalFormData((prev) => ({ ...prev, error: { ...prev.error, rtsp: ERROR_BLANK_VALUE } }));
        return true;
      }
      const rtspRe = new RegExp('^rtsp://.+');
      if (localFormData.media_type === 'Camera' && !rtspRe.test(localFormData.rtsp)) {
        setLocalFormData((prev) => ({
          ...prev,
          error: { ...prev.error, rtsp: ERROR_CAMERA_INVALID_RTSP },
        }));
        return true;
      }

      if (localFormData.media_type === 'Video' && localFormData.media_source === '') {
        setLocalFormData((prev) => ({
          ...prev,
          error: { ...prev.error, mediaSource: ERROR_BLANK_VALUE },
        }));
        return true;
      }
      const mediaSourceRe = new RegExp('(^(?:http|https)://.+)+');
      if (localFormData.media_type === 'Video' && !mediaSourceRe.test(localFormData.media_source)) {
        setLocalFormData((prev) => ({
          ...prev,
          error: { ...prev.error, mediaSource: ERROR_CAMERA_INVALID_VIDEO },
        }));
        return true;
      }

      if (localFormData.selectedDeviceList.length === 0) {
        setLocalFormData((prev) => ({
          ...prev,
          error: { ...prev.error, selectedDeviceList: ERROR_BLANK_VALUE },
        }));
        return true;
      }

      if (localFormData.location === -1) {
        setLocalFormData((prev) => ({
          ...prev,
          error: { ...prev.error, location: ERROR_BLANK_VALUE },
        }));
        return true;
      }

      if (currentStep === 'basics') return false;

      if (
        localFormData.tag_list.length > 1 &&
        localFormData.tag_list.some((tag) => tag.errorMessage !== '')
      ) {
        return true;
      }

      return false;
    },
    [localFormData, existingNameList],
  );

  const onFormDataChange = useCallback((newFormData: CreateCameraFormData) => {
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
          onLinkClick={(item) => onLinkClick(item?.props.itemKey! as PivotTabKey)}
          selectedKey={localPivotKey}
        >
          <PivotItem
            headerText="Basics"
            itemKey="basics"
            onRenderItemLink={(item: IPivotItemProps) => (
              <Stack horizontal>
                {Object.values(localFormData.error).some((error) => error !== '') && <ErrorIcon />}
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
            headerText="Review + Create"
            itemKey="preview"
            style={{ height: '100%', position: 'relative' }}
          />
        </Pivot>
        {isCreating && <Spinner size={3} />}
      </Stack>
      <Switch>
        <Route
          exact
          path={Url.CAMERAS_CREATION_PREVIEW}
          render={() => <Preview localFormData={localFormData} onLinkClick={onLinkClick} />}
        />
        <Route
          exact
          path={Url.CAMERAS_CREATION_TAG}
          render={() => (
            <TagTab tagList={localFormData.tag_list} onTagChange={onTagChange} onTagDelete={onTagDelete} />
          )}
        />
        <Route
          exact
          path={Url.CAMERAS_CREATION_BASICS}
          render={() => <Basics localFormData={localFormData} onFormDataChange={onFormDataChange} />}
        />
      </Switch>
      <Footer
        currentStep={localPivotKey}
        onLinkClick={onLinkClick}
        localFormData={localFormData}
        isCreating={isCreating}
        onIsCreatingChange={() => setIsCreating(true)}
        stepList={['basics', 'tag', 'preview']}
        onFormDateValidate={onFormDateValidate}
      />
    </>
  );
};

export default CameraCreate;
