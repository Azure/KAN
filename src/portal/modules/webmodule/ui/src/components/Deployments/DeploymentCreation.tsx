// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useCallback } from 'react';
import { Stack, Pivot, PivotItem, IPivotItemProps } from '@fluentui/react';
import { useHistory, generatePath, Route, Switch, useParams } from 'react-router-dom';
import { clone, isEmpty } from 'ramda';

import { Url, ERROR_BLANK_VALUE, ERROR_NAME_BE_USED, ERROR_NAME_BLANK } from '../../constant';
import { CreateDeploymentFormData, PivotTabKey, STEP_ORDER } from './types';
import { getDeploymentWrapperClasses } from './styles';

import TagTab, { Tag, getErrorMessage } from '../Common/TagTab';
import Basics from './Creation/Basics';
import Configure from './Creation/Configure';
import Preview from './Creation/Preview';
import CreationFooter from './Creation/CreationFooter';
import ErrorIcon from '../Common/ErrorIcon';

interface Props {
  existingNameList: string[];
}

const getBasicsError = (form: CreateDeploymentFormData, existingNameList: string[]) => {
  const error = {
    name: '',
    cameraList: '',
    device: '',
  };

  if (isEmpty(form.name)) error.name = ERROR_NAME_BLANK;
  if (existingNameList.includes(form.name)) error.name = ERROR_NAME_BE_USED;
  if (form.device.key === -1) error.device = ERROR_BLANK_VALUE;
  if (form.cameraList.length === 0) error.cameraList = ERROR_BLANK_VALUE;

  return error;
};

const DeploymentCreation = (props: Props) => {
  const { existingNameList } = props;

  const { step: createdStep } = useParams<{ step: PivotTabKey }>();
  const history = useHistory();
  const classes = getDeploymentWrapperClasses();

  const [isCreating, setIsCreating] = useState(false);
  const [localFormData, setLocalFormData] = useState<CreateDeploymentFormData>({
    name: '',
    cameraList: [],
    device: { key: -1, text: '', data: '' },
    tag_list: [{ name: '', value: '', errorMessage: '' }],
    error: {
      name: '',
      cameraList: '',
      device: '',
      skillList: '',
    },
  });
  const [localPivotKey, setLocalPivotKey] = useState<PivotTabKey>(createdStep);

  const onLinkClick = useCallback(
    (key: PivotTabKey) => {
      setLocalPivotKey(key);

      history.push(
        generatePath(Url.DEPLOYMENT_CREATION, {
          step: key,
        }),
      );
    },
    [history],
  );

  const onFormDataChange = useCallback((newFormData: CreateDeploymentFormData) => {
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
    (nextStep: PivotTabKey, currentStep?: PivotTabKey) => {
      const error = getBasicsError(localFormData, existingNameList);

      if (Object.values(error).some((value) => !isEmpty(value)) && currentStep === 'basics') {
        setLocalFormData((prev) => ({
          ...prev,
          error: { ...prev.error, ...error },
        }));

        return true;
      }

      if (
        localFormData.cameraList.length > 0 &&
        localFormData.cameraList.some((camera) => camera.skillList.length === 0) &&
        currentStep === 'configure'
      ) {
        setLocalFormData((prev) => ({
          ...prev,
          error: { ...prev.error, skillList: ERROR_BLANK_VALUE },
        }));
        return true;
      }

      if (
        localFormData.tag_list.length > 1 &&
        localFormData.tag_list.some((tag) => tag.errorMessage !== '') &&
        currentStep === 'tag'
      ) {
        return true;
      }

      return false;
    },
    [localFormData, existingNameList],
  );

  const onValidationRedirect = useCallback(
    (nextStep: PivotTabKey, currentStep: PivotTabKey) => {
      const nextStepIdx = STEP_ORDER.findIndex((step) => step === nextStep);
      const currentStepIdx = STEP_ORDER.findIndex((step) => step === currentStep);

      if (nextStepIdx > currentStepIdx) {
        const isInvalid = onFormDateValidate(nextStep, currentStep);

        if (isInvalid) return;
      }

      onLinkClick(nextStep);
    },
    [onLinkClick, onFormDateValidate],
  );

  return (
    <>
      <Stack styles={{ root: classes.root }}>
        <Stack horizontal verticalAlign="center">
          <Pivot
            onLinkClick={(item) => onValidationRedirect(item?.props.itemKey as PivotTabKey, localPivotKey)}
            selectedKey={localPivotKey}
          >
            <PivotItem
              headerText="Basics"
              itemKey="basics"
              onRenderItemLink={(item: IPivotItemProps) => (
                <Stack horizontal>
                  {[
                    localFormData.error.name,
                    localFormData.error.device,
                    localFormData.error.cameraList,
                  ].some((error) => error !== '') && <ErrorIcon />}
                  {item.headerText}
                </Stack>
              )}
            />
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
              headerText="Review + Create"
              itemKey="preview"
              style={{ height: '100%', position: 'relative' }}
            />
          </Pivot>
        </Stack>
      </Stack>
      <Stack
        styles={{
          root: {
            height: 'calc(100% - 220px)',
            overflowY: 'auto',
            padding: '0 20px',
          },
        }}
      >
        <Switch>
          <Route
            exact
            path={Url.DEPLOYMENT_CREATION_PREVIEW}
            render={() => <Preview localFormData={localFormData} onLinkClick={onLinkClick} />}
          />
          <Route
            exact
            path={Url.DEPLOYMENT_CREATION_TAG}
            render={() => (
              <TagTab tagList={localFormData.tag_list} onTagChange={onTagChange} onTagDelete={onTagDelete} />
            )}
          />
          <Route
            exact
            path={Url.DEPLOYMENT_CREATION_CONFIGURE}
            render={() => <Configure localFormData={localFormData} onFormDataChange={onFormDataChange} />}
          />
          <Route
            exact
            path={Url.DEPLOYMENT_CREATION_BASIC}
            render={() => <Basics localFormData={localFormData} onFormDataChange={onFormDataChange} />}
          />
        </Switch>
      </Stack>
      <CreationFooter
        currentStep={localPivotKey}
        onLinkClick={onLinkClick}
        localFormData={localFormData}
        isCreating={isCreating}
        onIsCreatingChange={() => setIsCreating(true)}
        stepList={STEP_ORDER}
        onFormDateValidate={onFormDateValidate}
        onValidationRedirect={onValidationRedirect}
      />
    </>
  );
};

export default DeploymentCreation;
