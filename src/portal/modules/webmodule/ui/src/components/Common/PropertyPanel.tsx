// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useState } from 'react';
import { Panel, Stack, DefaultButton, ProgressIndicator } from '@fluentui/react';

import { PageType } from '../constant';
import { getPropertyClasses } from './styles';

interface Props {
  onPanelClose: () => void;
  // selectedDeploymentId: string;
  // onTargetPropertyFetch: () => void;
  pageType: PageType;
  selectedId: number;
  onDeleteModalOpen: () => void;
}

const PropertyPanel = (props: Props) => {
  const { onPanelClose, onDeleteModalOpen } = props;

  const [isFetching, setIsFetching] = useState(false);
  const [localProperty, setLocqlPorperty] = useState('');

  const classes = getPropertyClasses();

  // useEffect(() => {
  //   (async () => {
  //     setIsFetching(true);
  //     const response = (await dispatch(getDeploymentProperty(selectedDeploymentId))) as any;

  //     setLocqlPorperty(response.payload);
  //     setIsFetching(false);
  //   })();
  // }, [dispatch, selectedDeploymentId]);

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
      headerText="Solution Instance Properties"
      onRenderFooterContent={onRenderFooterContent}
      isFooterAtBottom={true}
      onOuterClick={() => null}
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
          {localProperty}
        </Stack>
      )}
    </Panel>
  );
};

export default PropertyPanel;
