// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useCallback } from 'react';
import { Stack } from '@fluentui/react';
import { useDispatch } from 'react-redux';

import { deleteDeployment } from '../../../store/deploymentSlice';
import { FormattedDeployment } from '../types';

import Card from './Card';
import DeleteModal from '../../Common/DeleteModal';
import PropertyPanel from './PropertyPanel';

interface Props {
  deploymentList: FormattedDeployment[];
}

const ListManagement = (props: Props) => {
  const { deploymentList } = props;

  const dispatch = useDispatch();

  const [deletedDeployment, setDeletedDeployment] = useState<FormattedDeployment | null>(null);
  const [selectedDeployment, setSelectedDeployment] = useState<FormattedDeployment | null>(null);

  const onSingleDeploymentDelete = useCallback(() => {
    dispatch(deleteDeployment(deletedDeployment.id));

    setDeletedDeployment(null);
  }, [dispatch, deletedDeployment]);

  const onPropertiesPanelOpen = useCallback((deploy: FormattedDeployment) => {
    setSelectedDeployment(deploy);
  }, []);

  return (
    <>
      <Stack
        style={{ marginTop: '40px' }}
        styles={{ inner: { margin: '0' } }}
        wrap
        horizontal
        tokens={{ childrenGap: 30 }}
      >
        {deploymentList.map((deploy, idx) => (
          <Card
            key={idx}
            deployment={deploy}
            onDeleteModalOpen={() => setDeletedDeployment(deploy)}
            onPropertyOpen={() => onPropertiesPanelOpen(deploy)}
          />
        ))}
      </Stack>
      {deletedDeployment && (
        <DeleteModal
          type="deployment"
          name={deletedDeployment.name}
          onDelte={onSingleDeploymentDelete}
          onClose={() => setDeletedDeployment(null)}
        />
      )}
      {selectedDeployment && (
        <PropertyPanel
          onPanelClose={() => setSelectedDeployment(null)}
          selectedDeploymentId={selectedDeployment.id}
          onDeleteModalOpen={() => setDeletedDeployment(selectedDeployment)}
        />
      )}
    </>
  );
};

export default ListManagement;
