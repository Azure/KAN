// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useState, useEffect } from 'react';
import { Panel, Stack, DefaultButton, ProgressIndicator } from '@fluentui/react';
import { useDispatch } from 'react-redux';
import { getDeploymentProperty } from '../../../store/deploymentSlice';
import { theme } from '../../../constant';

interface Props {
  onPanelClose: () => void;
  selectedDeploymentId: number;
  onDeleteModalOpen: () => void;
}

const PropertyPanel = (props: Props) => {
  const { onPanelClose, onDeleteModalOpen, selectedDeploymentId } = props;

  const dispatch = useDispatch();

  const [isFetching, setIsFetching] = useState(false);
  const [localProperty, setLocqlPorperty] = useState('');

  useEffect(() => {
    (async () => {
      setIsFetching(true);
      const response = (await dispatch(getDeploymentProperty(selectedDeploymentId))) as any;

      setLocqlPorperty(response.payload);
      setIsFetching(false);
    })();
  }, [dispatch, selectedDeploymentId]);

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
      headerText="Deployment Properties"
      onRenderFooterContent={onRenderFooterContent}
      isFooterAtBottom={true}
      onOuterClick={() => null}
    >
      {isFetching ? (
        <ProgressIndicator />
      ) : (
        <Stack
          styles={{
            root: {
              paddingTop: '25px',
              whiteSpace: 'pre',
              color: theme.palette.black,
              fontSize: '13px',
              lineHeight: '18px',
              overflow: 'auto',
            },
          }}
          tokens={{ childrenGap: 15 }}
        >
          {localProperty}
        </Stack>
      )}
    </Panel>
  );
};

export default PropertyPanel;
