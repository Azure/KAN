import React, { useCallback, useState } from 'react';
import { useHistory, generatePath, useLocation, Route, Switch } from 'react-router-dom';
import { Pivot, PivotItem, Spinner, Stack } from '@fluentui/react';
import { clone } from 'ramda';
import { useSelector } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { selectAllComputeDevices } from '../../store/computeDeviceSlice';
import { Url } from '../../constant';
import { CreateComputeDeviceFormData, PivotTabKey } from './types';

import Basics from './Creation/Basics';
import Preview from './Creation/Preview';
import Footer from './Creation/Footer';
import TagPage, { Tag, getErrorMessage } from '../Common/TagPage';

const ComputeDeviceCreation = () => {
  const location = useLocation();
  const history = useHistory();

  const deviceList = useSelector((state: RootState) => selectAllComputeDevices(state));

  const [isCreating, setIsCreating] = useState(false);
  const [localFormData, setLocalFormData] = useState<CreateComputeDeviceFormData>({
    name: '',
    iotHub: '',
    iotedge_device: '',
    architecture: 'X64',
    acceleration: '-',
    tag_list: [{ name: '', value: '', errorMessage: null }],
    error: {
      name: '',
      iotHub: '',
      iotedge_device: '',
      acceleration: '',
    },
  });

  const [localPivotKey, setLocalPivotKey] = useState<PivotTabKey>(
    location.pathname.split('/')[3] as PivotTabKey,
  );

  const onLinkClick = useCallback(
    (key: PivotTabKey) => {
      setLocalPivotKey(key);

      history.push(
        generatePath(Url.COMPUTE_DEVICE_CREATION, {
          key,
        }),
      );
    },
    [history],
  );

  const onFormDataChange = useCallback((newFormData: CreateComputeDeviceFormData) => {
    setLocalFormData({ ...newFormData });
  }, []);

  const onTagChange = useCallback(
    (idx: number, newTag: Tag) => {
      console.log(idx, newTag);

      const newTagList = clone(localFormData.tag_list);

      const dupNameList = newTagList.map((tag) => tag.name);
      dupNameList.splice(idx, 1);

      newTagList.splice(idx, 1, { ...newTag, errorMessage: getErrorMessage(newTag, dupNameList) });

      if (localFormData.tag_list.length - 1 === idx)
        newTagList.push({ name: '', value: '', errorMessage: null });

      setLocalFormData((prev) => ({ ...prev, tag_list: newTagList }));
    },
    [localFormData.tag_list],
  );

  const onTagDelete = useCallback(
    (idx: number) => {
      setLocalFormData((prev) => {
        const newTagList = clone(localFormData.tag_list);
        newTagList.splice(idx, 1);

        return { ...prev, tagList: newTagList };
      });
    },
    [localFormData.tag_list],
  );

  const onFormDateValidate = useCallback(() => {
    if (localFormData.name === '') {
      setLocalFormData((prev) => ({ ...prev, error: { ...prev.error, name: 'Name cannot be blank' } }));
      return true;
    }
    if (deviceList.map((device) => device.name).includes(localFormData.name)) {
      setLocalFormData((prev) => ({ ...prev, error: { ...prev.error, name: 'Name is already used' } }));
      return true;
    }
    if (localFormData.iotHub === '') {
      setLocalFormData((prev) => ({ ...prev, error: { ...prev.error, iotHub: 'Value cannot be blank.' } }));
      return true;
    }
    if (localFormData.iotedge_device === '') {
      setLocalFormData((prev) => ({
        ...prev,
        error: { ...prev.error, iotedge_device: 'Value cannot be blank.' },
      }));
      return true;
    }
    if (localFormData.acceleration === '-') {
      setLocalFormData((prev) => ({
        ...prev,
        error: { ...prev.error, acceleration: 'The value must selected' },
      }));
      return true;
    }

    return false;
  }, [localFormData]);

  const onValidationRedirect = useCallback(
    (key: PivotTabKey) => {
      if (onFormDateValidate()) return;

      onLinkClick(key);
    },
    [localFormData, onLinkClick, onFormDateValidate],
  );

  console.log('localFormData', localFormData);

  return (
    <>
      <Stack horizontal verticalAlign="center">
        <Pivot
          styles={{ itemContainer: { height: 'calc(100% - 44px)' } }}
          onLinkClick={(item) => onLinkClick(item?.props.itemKey! as PivotTabKey)}
          selectedKey={localPivotKey}
        >
          <PivotItem headerText="Basics" itemKey="basics" />
          <PivotItem headerText="Tags (Optional)" itemKey="tag" />
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
          path={Url.COMPUTE_DEVICE_CREATION_PREVIEW}
          render={() => <Preview localFormData={localFormData} onTagRedirect={() => onLinkClick('tag')} />}
        />
        <Route
          exact
          path={Url.COMPUTE_DEVICE_CREATION_TAG}
          render={() => (
            <TagPage tagList={localFormData.tag_list} onTagChange={onTagChange} onTagDelete={onTagDelete} />
          )}
        />
        <Route
          exact
          path={Url.COMPUTE_DEVICE_CREATION_BASIC}
          render={() => <Basics localFormData={localFormData} onFormDataChange={onFormDataChange} />}
        />
      </Switch>
      <Footer
        currentStep={localPivotKey}
        onLinkClick={onLinkClick}
        localFormData={localFormData}
        isCreating={isCreating}
        onCreatingChange={() => setIsCreating(true)}
        onValidationRedirect={onValidationRedirect}
        stepList={['basics', 'tag', 'preview']}
        onFormDateValidate={onFormDateValidate}
      />
    </>
  );
};

export default ComputeDeviceCreation;
