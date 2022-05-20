import React, { useCallback, useState } from 'react';
import { useHistory, generatePath, useLocation, Route, Switch } from 'react-router-dom';
import { Pivot, PivotItem, Spinner, Stack, IPivotItemProps } from '@fluentui/react';
import { clone } from 'ramda';
import { useSelector } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { Url } from '../../constant';
import { CreateCameraFormData, PivotTabKey } from './types';
import { selectAllCameras } from '../../store/cameraSlice';

import Basics from './CameraCreate/Basics';
import Preview from './CameraCreate/Preview';
import Footer from './CameraCreate/Footer';
import TagPage, { Tag, getErrorMessage } from '../Common/TagPage';
import ErrorIcon from '../Common/ErrorIcon';

const CameraCreate = () => {
  const location = useLocation();
  const history = useHistory();

  const cameraList = useSelector((state: RootState) => selectAllCameras(state));

  const [isCreating, setIsCreating] = useState(false);
  const [localFormData, setLocalFormData] = useState<CreateCameraFormData>({
    name: '',
    media_type: 'Camera',
    videoType: 'link',
    location: -1,
    rtsp: '',
    media_source: '',
    tagList: [{ name: '', value: '', errorMessage: '' }],
    selectedDeviceList: [],
    userName: '',
    password: '',
    error: {
      name: '',
      rtsp: '',
      mediaSource: '',
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
        generatePath(Url.CAMERAS2_CREATION, {
          key,
        }),
      );
    },
    [history],
  );

  const onFormDateValidate = useCallback(
    (currentStep: PivotTabKey) => {
      if (localFormData.name === '') {
        setLocalFormData((prev) => ({ ...prev, error: { ...prev.error, name: 'Name cannot be blank' } }));
        return true;
      }
      if (cameraList.map((cam) => cam.name).includes(localFormData.name)) {
        setLocalFormData((prev) => ({ ...prev, error: { ...prev.error, name: 'Name is already used' } }));
        return true;
      }
      if (localFormData.media_type === 'Camera' && localFormData.rtsp === '') {
        setLocalFormData((prev) => ({ ...prev, error: { ...prev.error, rtsp: 'Value cannot be blank.' } }));
        return true;
      }
      const rtspRe = new RegExp('^rtsp://.+');
      if (localFormData.media_type === 'Camera' && !rtspRe.test(localFormData.rtsp)) {
        setLocalFormData((prev) => ({
          ...prev,
          error: { ...prev.error, rtsp: 'Please provide a valid RTSP link' },
        }));
        return true;
      }

      if (localFormData.media_type === 'Video' && localFormData.media_source === '') {
        setLocalFormData((prev) => ({
          ...prev,
          error: { ...prev.error, mediaSource: 'Value cannot be blank.' },
        }));
        return true;
      }
      const mediaSourceRe = new RegExp('(^(?:http|https)://.+)+');
      if (localFormData.media_type === 'Video' && !mediaSourceRe.test(localFormData.rtsp)) {
        setLocalFormData((prev) => ({
          ...prev,
          error: { ...prev.error, mediaSource: 'Please provide a valid link to download video' },
        }));
        return true;
      }

      if (localFormData.location === -1) {
        setLocalFormData((prev) => ({
          ...prev,
          error: { ...prev.error, location: 'Value cannot be blank.' },
        }));
        return true;
      }

      if (currentStep === 'basics') return false;

      if (localFormData.tagList.length > 1 && localFormData.tagList.some((tag) => tag.errorMessage !== '')) {
        return true;
      }

      return false;
    },
    [localFormData, cameraList],
  );

  console.log('localFormData', localFormData);

  const onFormDataChange = useCallback((newFormData: CreateCameraFormData) => {
    setLocalFormData({ ...newFormData });
  }, []);

  const onTagChange = useCallback(
    (idx: number, newTag: Tag) => {
      let newTagList = clone(localFormData.tagList);

      const dupNameList = newTagList.map((tag) => tag.name);
      dupNameList.splice(idx, 1);

      newTagList.splice(idx, 1, { ...newTag, errorMessage: getErrorMessage(newTag, dupNameList) });

      if (localFormData.tagList.length - 1 === idx)
        newTagList.push({ name: '', value: '', errorMessage: '' });

      setLocalFormData((prev) => ({ ...prev, tagList: newTagList }));
    },
    [localFormData.tagList],
  );

  const onTagDelete = useCallback(
    (idx: number) => {
      setLocalFormData((prev) => {
        const newTagList = clone(localFormData.tagList);
        newTagList.splice(idx, 1);

        return { ...prev, tagList: newTagList };
      });
    },
    [localFormData.tagList],
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
                {localFormData.tagList.length > 1 &&
                  localFormData.tagList.some((tag) => tag.errorMessage !== '') && <ErrorIcon />}
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
          path={Url.CAMERAS2_CREATION_PREVIEW}
          render={() => <Preview localFormData={localFormData} onTagRedirect={() => onLinkClick('tag')} />}
        />
        <Route
          exact
          path={Url.CAMERAS2_CREATION_TAG}
          render={() => (
            <TagPage tagList={localFormData.tagList} onTagChange={onTagChange} onTagDelete={onTagDelete} />
          )}
        />
        <Route
          exact
          path={Url.CAMERAS2_CREATION_BASICS}
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
