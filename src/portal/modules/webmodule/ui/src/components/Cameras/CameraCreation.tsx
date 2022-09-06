// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useState } from 'react';
import { useHistory, generatePath, Route, Switch, useParams } from 'react-router-dom';
import { Pivot, PivotItem, Spinner, Stack, IPivotItemProps } from '@fluentui/react';
import { clone, isEmpty } from 'ramda';

import { Url, ERROR_BLANK_VALUE, ERROR_NAME_BLANK, ERROR_NAME_BE_USED } from '../../constant';
import { CreateCameraFormData, PivotTabKey, MediaType } from './types';
import { getScrllStackClasses } from '../Common/styles';

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

const getUrlMessage = (url: string, mediaType: MediaType) => {
  const rtspRe = new RegExp('^rtsp://.+');
  const mediaSourceRe = new RegExp('(^(?:http|https)://.+)+');

  if (isEmpty(url)) return ERROR_BLANK_VALUE;
  if (mediaType === 'Camera' && !rtspRe.test(url)) return ERROR_CAMERA_INVALID_RTSP;
  if (mediaType === 'Video' && !mediaSourceRe.test(url)) return ERROR_CAMERA_INVALID_RTSP;
  return '';
};

const getLocalFormError = (form: CreateCameraFormData, existingNameList: string[]) => {
  const error = {
    name: '',
    rtsp: '',
    mediaSource: '',
    selectedDeviceList: '',
    location: '',
  };

  if (isEmpty(form.name)) error.name = ERROR_NAME_BLANK;
  if (existingNameList.includes(form.name)) error.name = ERROR_NAME_BE_USED;
  if (form.media_type === 'Camera') {
    error.rtsp = getUrlMessage(form.rtsp, form.media_type);
  } else {
    error.mediaSource = getUrlMessage(form.media_source, form.media_type);
  }
  if (form.selectedDeviceList.length === 0) error.selectedDeviceList = ERROR_BLANK_VALUE;
  if (form.location === -1) error.location = ERROR_BLANK_VALUE;

  return error;
};

const CameraCreate = (props: Props) => {
  const { existingNameList } = props;

  const scrollClasses = getScrllStackClasses();
  const history = useHistory();
  const { step } = useParams<{ step: PivotTabKey }>();

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
  const [localPivotKey, setLocalPivotKey] = useState<PivotTabKey>(step);

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
    (_: PivotTabKey) => {
      const error = getLocalFormError(localFormData, existingNameList);

      if (Object.values(error).some((value) => !isEmpty(value))) {
        setLocalFormData((prev) => ({
          ...prev,
          error,
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

  const onValidationRedirect = useCallback(
    (key: PivotTabKey) => {
      if (onFormDateValidate(key)) return;

      onLinkClick(key);
    },
    [onLinkClick, onFormDateValidate],
  );

  return (
    <>
      <Stack horizontal verticalAlign="center">
        <Pivot
          styles={{ itemContainer: { height: 'calc(100% - 44px)' } }}
          onLinkClick={(item) => onValidationRedirect(item?.props.itemKey as PivotTabKey)}
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
      <Stack styles={{ root: scrollClasses.root }}>
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
      </Stack>
      <Footer
        currentStep={localPivotKey}
        localFormData={localFormData}
        isCreating={isCreating}
        onIsCreatingChange={() => setIsCreating(true)}
        stepList={['basics', 'tag', 'preview']}
        onFormDateValidate={onFormDateValidate}
        onValidationRedirect={onValidationRedirect}
      />
    </>
  );
};

export default CameraCreate;
