// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useCallback } from 'react';
import { Stack, Pivot, PivotItem, IPivotItemProps } from '@fluentui/react';
import { useHistory, generatePath, Route, Switch, useParams } from 'react-router-dom';
import { clone } from 'ramda';

import { Url, ERROR_BLANK_VALUE, ERROR_NAME_BE_USED, ERROR_NAME_BLANK } from '../../constant';
import { CreateDeploymentFormData, PivotTabKey } from './types';
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

const DeploymentCreation = (props: Props) => {
  const { existingNameList } = props;
  const { key } = useParams<{ key: PivotTabKey }>();

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
  const [localPivotKey, setLocalPivotKey] = useState<PivotTabKey>(key);

  const onLinkClick = useCallback(
    (key: PivotTabKey) => {
      setLocalPivotKey(key);

      history.push(
        generatePath(Url.DEPLOYMENT_CREATION, {
          key,
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
    (currentStep: PivotTabKey) => {
      if (localFormData.name === '') {
        setLocalFormData((prev) => ({ ...prev, error: { ...prev.error, name: ERROR_NAME_BLANK } }));
        return true;
      }

      if (existingNameList.includes(localFormData.name)) {
        setLocalFormData((prev) => ({ ...prev, error: { ...prev.error, name: ERROR_NAME_BE_USED } }));
        return true;
      }

      if (localFormData.device.key === -1) {
        setLocalFormData((prev) => ({ ...prev, error: { ...prev.error, device: ERROR_BLANK_VALUE } }));
        return true;
      }

      if (localFormData.cameraList.length === 0) {
        setLocalFormData((prev) => ({
          ...prev,
          error: { ...prev.error, cameraList: ERROR_BLANK_VALUE },
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
          error: { ...prev.error, skillList: ERROR_BLANK_VALUE },
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

  return (
    <>
      <Stack styles={{ root: classes.root }}>
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
        <Switch>
          <Route
            exact
            path={Url.DEPLOYMENT_CREATION_PREVIEW}
            render={() => (
              <Preview
                localFormData={localFormData}
                onLinkClick={onLinkClick}
                // onConfigureRedirect={() => onLinkClick('configure')}
              />
            )}
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
        stepList={['basics', 'configure', 'tag', 'preview']}
        onFormDateValidate={onFormDateValidate}
      />
    </>
  );
};

export default DeploymentCreation;
