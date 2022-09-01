// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useCallback } from 'react';
import { Stack, Pivot, PivotItem, IPivotItemProps, IDropdownOption, Spinner } from '@fluentui/react';
import { useHistory, generatePath, useLocation, Route, Switch } from 'react-router-dom';
import { clone } from 'ramda';
import { useSelector } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { CreateModelFormData, PivotTabKey } from './types';
import { Url, ERROR_BLANK_VALUE, ERROR_NAME_BLANK } from '../../constant';
import { customVisionTrainingProjectFactory } from '../../store/trainingProjectSlice';

import Basics from './Creation/Basics';
import Preview from './Creation/Preview';
import TagTab, { Tag, getErrorMessage } from '../Common/TagTab';
import Footer from './Creation/Footer';
import ErrorIcon from '../Common/ErrorIcon';

const ERROR_LEAST_ONE_OBJECT = 'At least 1 object. Type object and press enter';
const ERROR_LEAST_TWO_OBJECT = 'At least 2 objects. Type object and press enter';

const ModelCreation = () => {
  const history = useHistory();
  const location = useLocation();

  const customVisionProject = useSelector((state: RootState) => state.setting.cvProjects);
  const customVisionTrainingProject = useSelector(customVisionTrainingProjectFactory());

  const customVisionProjectOptions: IDropdownOption[] = customVisionProject.map((e) => ({
    key: e.id,
    text: e.name,
    disabled: customVisionTrainingProject.map((cv) => cv.customVisionId).includes(e.id) || !e.exportable,
  }));

  const [isCreating, setIsCreating] = useState(false);
  const [localFormData, setLocalFormData] = useState<CreateModelFormData>({
    createType: '',
    type: '',
    name: '',
    objects: [],
    customVisionId: '',
    classification: 'Multilabel',
    tag_list: [{ name: '', value: '', errorMessage: '' }],
    error: {
      createType: '',
      name: '',
      type: '',
      objects: '',
      customVisionId: '',
      classification: '',
    },
  });
  const [localPivotKey, setLocalPivotKey] = useState<PivotTabKey>(
    location.pathname.split('/')[3] as PivotTabKey,
  );

  const onLinkClick = useCallback(
    (key: PivotTabKey) => {
      setLocalPivotKey(key);

      history.push(
        generatePath(Url.MODELS_CREATION, {
          key,
        }),
      );
    },
    [history],
  );

  const onFormDataChange = useCallback((newFormData: CreateModelFormData) => {
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
      if (localFormData.createType === '') {
        setLocalFormData((prev) => ({
          ...prev,
          error: { ...prev.error, createType: ERROR_BLANK_VALUE },
        }));
        return true;
      }

      if (localFormData.createType === 'yes' && localFormData.customVisionId === '') {
        setLocalFormData((prev) => ({
          ...prev,
          error: { ...prev.error, customVisionId: ERROR_BLANK_VALUE },
        }));
        return true;
      }

      if (localFormData.createType === 'no') {
        if (localFormData.name === '') {
          setLocalFormData((prev) => ({ ...prev, error: { ...prev.error, name: ERROR_NAME_BLANK } }));
          return true;
        }

        if (localFormData.type === '') {
          setLocalFormData((prev) => ({
            ...prev,
            error: { ...prev.error, type: ERROR_BLANK_VALUE },
          }));
          return true;
        }

        // if (localFormData.type === 'Classification' && localFormData.classification === '') {
        //   setLocalFormData((prev) => ({
        //     ...prev,
        //     error: { ...prev.error, classification: 'Value cannot be blank.' },
        //   }));
        //   return true;
        // }

        if (localFormData.type === 'ObjectDetection' && localFormData.objects.length === 0) {
          setLocalFormData((prev) => ({
            ...prev,
            error: { ...prev.error, objects: ERROR_LEAST_ONE_OBJECT },
          }));
          return true;
        }

        if (localFormData.type === 'Classification' && localFormData.objects.length < 2) {
          setLocalFormData((prev) => ({
            ...prev,
            error: { ...prev.error, objects: ERROR_LEAST_TWO_OBJECT },
          }));
          return true;
        }
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
          path={Url.MODELS_CREATION_PREVIEW}
          render={() => (
            <Preview
              localFormData={localFormData}
              onLinkClick={onLinkClick}
              customVisionName={
                localFormData.customVisionId
                  ? customVisionProject.find((project) => project.id === localFormData.customVisionId).name
                  : ''
              }
            />
          )}
        />
        <Route
          exact
          path={Url.MODELS_CREATION_TAG}
          render={() => (
            <TagTab tagList={localFormData.tag_list} onTagChange={onTagChange} onTagDelete={onTagDelete} />
          )}
        />
        <Route
          exact
          path={Url.MODELS_CREATION_BASIC}
          render={() => (
            <Basics
              localFormData={localFormData}
              onFormDataChange={onFormDataChange}
              customVisionProjectOptions={customVisionProjectOptions}
            />
          )}
        />
      </Switch>
      <Footer
        currentStep={localPivotKey}
        onLinkClick={onLinkClick}
        localFormData={localFormData}
        isCreating={isCreating}
        onModelCreating={() => setIsCreating(true)}
        stepList={['basics', 'tag', 'preview']}
        onFormDateValidate={onFormDateValidate}
      />
    </>
  );
};

export default ModelCreation;
