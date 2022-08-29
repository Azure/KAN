// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useState } from 'react';
import { Panel, Stack, DefaultButton, ProgressIndicator } from '@fluentui/react';

interface Props {
  onPanelClose: () => void;
  selectedDeploymentId: string;
  onDeleteModalOpen: () => void;
}

const CameraSidePanel = (props: Props) => {
  const { onPanelClose, onDeleteModalOpen } = props;

  const [isFetching, setIsFetching] = useState(false);
  const [localProperty, setLocqlPorperty] = useState(null);

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
        <Stack styles={{ root: { paddingTop: '25px' } }} tokens={{ childrenGap: 15 }}></Stack>
      )}
    </Panel>
  );
};

export default CameraSidePanel;
