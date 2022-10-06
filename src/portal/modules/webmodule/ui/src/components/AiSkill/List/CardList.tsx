// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useCallback } from 'react';
import { Stack } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';

import { AiSkill } from '../../../store/types';
import { deleteAiSkill } from '../../../store/cascadeSlice';
import { selectHasUseAiSkillSelectorFactory } from '../../../store/deploymentSlice';

import Card from './Card';
import DeleteModal from '../../Common/DeleteModal';
import DefinitionPanel from '../../Common/DefinitionPanel';

interface Props {
  skillList: AiSkill[];
}

const List = (props: Props) => {
  const { skillList } = props;

  const dispatch = useDispatch();

  const [deletedSkill, setDeletedSkill] = useState<AiSkill | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<AiSkill | null>(null);
  const hasAiSkillDeployment = useSelector(
    selectHasUseAiSkillSelectorFactory(deletedSkill?.symphony_id ?? ''),
  );

  const onSingleCascadeDelete = useCallback(async () => {
    await dispatch(deleteAiSkill({ id: deletedSkill.id, symphony_id: deletedSkill.symphony_id }));
    setDeletedSkill(null);
  }, [dispatch, deletedSkill]);

  return (
    <>
      <Stack
        styles={{ root: { marginTop: '40px' }, inner: { margin: '0' } }}
        wrap
        horizontal
        tokens={{ childrenGap: 30 }}
      >
        {skillList.map((skill, key) => (
          <Card
            key={key}
            skill={skill}
            onDeleteModalOpen={() => setDeletedSkill(skill)}
            onDefinitionOpen={() => setSelectedDefinition(skill)}
          />
        ))}
      </Stack>
      {deletedSkill && (
        <DeleteModal
          type="skill"
          name={deletedSkill.name}
          onDelte={onSingleCascadeDelete}
          onClose={() => setDeletedSkill(null)}
          isUsed={hasAiSkillDeployment}
        />
      )}
      {selectedDefinition && (
        <DefinitionPanel
          onPanelClose={() => setSelectedDefinition(null)}
          selectedTargetId={selectedDefinition.symphony_id}
          pageType="skill"
          onDeleteModalOpen={() => setDeletedSkill(selectedDefinition)}
        />
      )}
    </>
  );
};

export default List;
