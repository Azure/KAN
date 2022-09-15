// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useCallback } from 'react';
import { Stack } from '@fluentui/react';
import { useDispatch } from 'react-redux';

import { deleteDeployment } from '../../../store/deploymentSlice';
import { FormattedDeployment } from '../types';

import Card from './Card';
import DeleteModal from '../../Common/DeleteModal';
import DefinitionPanel from '../../Common/DefinitionPanel';

interface Props {
  deploymentList: FormattedDeployment[];
}

const ListManagement = (props: Props) => {
  const { deploymentList } = props;

  const dispatch = useDispatch();

  const [deletedDeployment, setDeletedDeployment] = useState<FormattedDeployment | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<FormattedDeployment | null>(null);

  const onSingleDeploymentDelete = useCallback(() => {
    dispatch(deleteDeployment(deletedDeployment.id));

    setDeletedDeployment(null);
  }, [dispatch, deletedDeployment]);

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
            onPropertyOpen={() => setSelectedDefinition(deploy)}
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
      {selectedDefinition && (
        <DefinitionPanel
          onPanelClose={() => setSelectedDefinition(null)}
          selectedTargetId={selectedDefinition.id}
          onDeleteModalOpen={() => setDeletedDeployment(selectedDefinition)}
          pageType="deployment"
        />
      )}
    </>
  );
};

export default ListManagement;
