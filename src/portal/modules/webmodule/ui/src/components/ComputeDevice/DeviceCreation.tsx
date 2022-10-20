// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useState } from 'react';
import { useHistory, generatePath, Route, Switch, useParams } from 'react-router-dom';
import { Pivot, PivotItem, Spinner, Stack, IPivotItemProps } from '@fluentui/react';
import { clone, isEmpty } from 'ramda';

import { Url, ERROR_BLANK_VALUE, ERROR_NAME_BE_USED, ERROR_NAME_BLANK } from '../../constant';
import { CreateComputeDeviceFormData, PivotTabKey, DeviceCreateType } from './types';
import { getScrllStackClasses } from '../Common/styles';
import { useQuery } from '../../hooks/useQuery';

import Basics from './Creation/Basics';
import Preview from './Common/Preview';
import CreateFooter from './Creation/CreateFooter';
import TagTab, { Tag, getErrorMessage } from '../Common/TagTab';
import ErrorIcon from '../Common/ErrorIcon';

interface Props {
  existingNameList: string[];
}

const ERROR_FILE_BLANK = 'Config File should not be empty.';

const getLocalFormError = (form: CreateComputeDeviceFormData, existingNameList: string[]) => {
  const error = {
    name: '',
    iotHub: '',
    iotedge_device: '',
    acceleration: '',
    cluster_type: '',
    config_data: '',
  };

  if (isEmpty(form.name)) error.name = ERROR_NAME_BLANK;
  if (existingNameList.includes(form.name)) error.name = ERROR_NAME_BE_USED;

  if (!form.is_k8s) {
    if (isEmpty(form.iothub)) error.iotHub = ERROR_BLANK_VALUE;
    if (isEmpty(form.iotedge_device)) error.iotedge_device = ERROR_BLANK_VALUE;
  }

  if (form.is_k8s && form.cluster_type === 'other' && isEmpty(form.config_data))
    error.config_data = ERROR_FILE_BLANK;

  if (form.acceleration === '-') error.acceleration = ERROR_BLANK_VALUE;
  return error;
};

const ComputeDeviceCreation = (props: Props) => {
  const { existingNameList } = props;

  const { step } = useParams<{ step: PivotTabKey }>();
  const history = useHistory();
  const scrllStackClasses = getScrllStackClasses();
  const createType = (useQuery().get('type') as DeviceCreateType) ?? 'iot';

  const [isCreating, setIsCreating] = useState(false);
  const [localFormData, setLocalFormData] = useState<CreateComputeDeviceFormData>({
    name: '',
    iothub: '',
    iotedge_device: '',
    architecture: 'X64',
    acceleration: '-',
    tag_list: [{ name: '', value: '', errorMessage: '' }],
    cluster_type: 'current',
    is_k8s: createType === 'k8s',
    config_data: '',
    error: {
      name: '',
      iotHub: '',
      iotedge_device: '',
      acceleration: '',
      config_data: '',
    },
  });
  const [localPivotKey, setLocalPivotKey] = useState<PivotTabKey>(step);

  const onLinkClick = useCallback(
    (key: PivotTabKey) => {
      setLocalPivotKey(key);

      history.push({
        pathname: generatePath(Url.COMPUTE_DEVICE_CREATION, {
          step: key,
        }),
        search: `type=${createType}`,
      });
    },
    [history, createType],
  );

  const onFormDataChange = useCallback((newFormData: CreateComputeDeviceFormData) => {
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
      <Stack styles={{ root: scrllStackClasses.root }}>
        <Switch>
          <Route
            exact
            path={Url.COMPUTE_DEVICE_CREATION_PREVIEW}
            render={() => <Preview localFormData={localFormData} onLinkClick={onLinkClick} />}
          />
          <Route
            exact
            path={Url.COMPUTE_DEVICE_CREATION_TAG}
            render={() => (
              <TagTab tagList={localFormData.tag_list} onTagChange={onTagChange} onTagDelete={onTagDelete} />
            )}
          />
          <Route
            exact
            path={Url.COMPUTE_DEVICE_CREATION_BASIC}
            render={() => (
              <Basics
                localFormData={localFormData}
                onFormDataChange={onFormDataChange}
                createType={createType}
              />
            )}
          />
        </Switch>
      </Stack>
      <CreateFooter
        currentStep={localPivotKey}
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

export default ComputeDeviceCreation;
