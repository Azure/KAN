// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useState, useEffect } from 'react';
import { Panel, Stack, DefaultButton, ProgressIndicator, PanelType } from '@fluentui/react';
import { useDispatch } from 'react-redux';
import Highlight from 'react-highlight';
import 'highlight.js/styles/stackoverflow-light.css';

import { PageType } from '../constant';
import { getPropertyClasses } from './styles';
import { getComputeDeviceDefinition } from '../../store/computeDeviceSlice';
import { getCameraDefinition } from '../../store/cameraSlice';
import { getCustomVisionProjectDefinition } from '../../store/trainingProjectSlice';
import { getAiSkillDefinition } from '../../store/cascadeSlice';
import { getDeploymentDefinition } from '../../store/deploymentSlice';

interface Props {
  onPanelClose: () => void;
  pageType: PageType;
  selectedTargetId: number | string;
  onDeleteModalOpen: () => void;
}

const getRequestMethod = (pageType: PageType, id: number | string) => {
  switch (pageType) {
    case 'deivce':
      return getComputeDeviceDefinition(id as string);
    case 'camera':
      return getCameraDefinition(id as string);
    case 'model':
      return getCustomVisionProjectDefinition(+id);
    case 'skill':
      return getAiSkillDefinition(id as string);
    case 'deployment':
      return getDeploymentDefinition(id as string);
    default:
      return getDeploymentDefinition(id as string);
  }
};

const getTitle = (pageType: PageType) => {
  switch (pageType) {
    case 'deivce':
      return 'Compute Devices Definition';
    case 'camera':
      return 'Cameras Definition';
    case 'model':
      return 'Models Definition';
    case 'skill':
      return 'AI Skills Definition';
    case 'deployment':
      return 'Deployment Definition';
    default:
      return '';
  }
};

const DefinitionPanel = (props: Props) => {
  const { onPanelClose, onDeleteModalOpen, pageType, selectedTargetId } = props;

  const [isFetching, setIsFetching] = useState(false);
  const [localProperty, setLocqlPorperty] = useState('');

  const classes = getPropertyClasses();
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      setIsFetching(true);

      const response = (await dispatch(getRequestMethod(pageType, selectedTargetId))) as any;

      setLocqlPorperty(response.payload);

      setIsFetching(false);
    })();
  }, [dispatch, pageType, selectedTargetId]);

  const onRenderFooterContent = useCallback(
    () => (
      <DefaultButton iconProps={{ iconName: 'Delete' }} onClick={onDeleteModalOpen}>
        Delete
      </DefaultButton>
    ),
    [onDeleteModalOpen],
  );

  return (
    <Panel
      isOpen={true}
      onDismiss={onPanelClose}
      hasCloseButton
      headerText={getTitle(pageType)}
      onRenderFooterContent={onRenderFooterContent}
      isFooterAtBottom={true}
      onOuterClick={() => null}
      type={PanelType.medium}
    >
      {isFetching ? (
        <ProgressIndicator />
      ) : (
        <Stack
          styles={{
            root: classes.root,
          }}
          tokens={{ childrenGap: 15 }}
        >
          <Highlight language="mk">{localProperty}</Highlight>
        </Stack>
      )}
    </Panel>
  );
};

export default DefinitionPanel;
