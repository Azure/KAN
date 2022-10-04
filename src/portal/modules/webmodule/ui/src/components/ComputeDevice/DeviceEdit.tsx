// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useState, useEffect } from 'react';
import { useHistory, generatePath, Route, Switch, useParams } from 'react-router-dom';
import { Pivot, PivotItem, Spinner, Stack, IPivotItemProps } from '@fluentui/react';
import { clone } from 'ramda';
import { useSelector } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { Url } from '../../constant';
import { UpdateComputeDeviceFromData, PivotTabKey } from './types';
import { selectComputeDeviceById } from '../../store/computeDeviceSlice';
import { getScrllStackClasses } from '../Common/styles';

import Basics from './Edit/Basics';
import Preview from './Common/Preview';
import EditFooter from './Edit/EditFooter';
import TagTab, { Tag, getErrorMessage } from '../Common/TagTab';
import ErrorIcon from '../Common/ErrorIcon';

const DeviceEdit = () => {
  const { id, step } = useParams<{ id: string; step: PivotTabKey }>();
  const history = useHistory();
  const scrllStackClasses = getScrllStackClasses();

  const device = useSelector((state: RootState) => selectComputeDeviceById(state, id));
  const [isCreating, setIsCreating] = useState(false);
  const [localFormData, setLocalFormData] = useState<UpdateComputeDeviceFromData>({
    name: '',
    iothub: '',
    iotedge_device: '',
    acceleration: '',
    architecture: '',
    tag_list: [],
    is_k8s: true,
    cluster_type: '',
  });
  const [localPivotKey, setLocalPivotKey] = useState<PivotTabKey>(step);

  useEffect(() => {
    if (!device) return;

    setLocalFormData({
      name: device.name,
      iothub: device.iothub,
      iotedge_device: device.iotedge_device,
      acceleration: device.acceleration,
      architecture: device.architecture,
      is_k8s: device.is_k8s,
      cluster_type: device.cluster_type,
      tag_list: [
        ...device.tag_list.map((tag) => ({ ...tag, errorMessage: '' })),
        { name: '', value: '', errorMessage: '' },
      ],
    });
  }, [device]);

  const onLinkClick = useCallback(
    (key: PivotTabKey) => {
      setLocalPivotKey(key);

      history.push({
        pathname: generatePath(Url.COMPUTE_DEVICE_EDIT, {
          id,
          step: key,
        }),
        search: `type=${device.is_k8s ? 'k8s' : 'iot'}`,
      });
    },
    [history, device.is_k8s, id],
  );

  const onFormDataChange = useCallback((newFormData: UpdateComputeDeviceFromData) => {
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
      if (currentStep === 'tag') return false;

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
        {isCreating && <Spinner size={3} />}
      </Stack>
      <Stack styles={{ root: scrllStackClasses.root }}>
        <Switch>
          <Route
            exact
            path={Url.COMPUTE_DEVICE_EDIT_PREVIEW}
            render={() => <Preview localFormData={localFormData} onLinkClick={onLinkClick} />}
          />
          <Route
            exact
            path={Url.COMPUTE_DEVICE_EDIT_TAG}
            render={() => (
              <TagTab tagList={localFormData.tag_list} onTagChange={onTagChange} onTagDelete={onTagDelete} />
            )}
          />
          <Route
            exact
            path={Url.COMPUTE_DEVICE_EDIT_BASIC}
            render={() => <Basics localFormData={localFormData} onFormDataChange={onFormDataChange} />}
          />
        </Switch>
      </Stack>
      <EditFooter
        id={device.id}
        symphony_id={device.symphony_id}
        currentStep={localPivotKey}
        onLinkClick={onLinkClick}
        localFormData={localFormData}
        isCreating={isCreating}
        onIsCreatingChange={() => setIsCreating(true)}
        onValidationRedirect={onValidationRedirect}
        stepList={['basics', 'tag', 'preview']}
        onFormDateValidate={onFormDateValidate}
      />
    </>
  );
};

export default DeviceEdit;
