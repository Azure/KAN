// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useMemo, useCallback } from 'react';
import { Stack, Text, CommandBar, ICommandBarItemProps } from '@fluentui/react';
import { useHistory, generatePath } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { deleteTrainingProject } from '../../../store/trainingProjectSlice';
import { FormattedModel } from '../../../store/types';
import { theme, Url } from '../../../constant';

import ModelCard from '../List/ModelCard';
import ModelSidePanel from '../ModelSidePanel';
import DeleteModal from '../../Common/DeleteModal';

interface Props {
  modelList: FormattedModel[];
}

const openIcon = { iconName: 'ChevronUp' };
const closeIcon = { iconName: 'ChevronDown' };

const CustomVisionVModelDashboard = (props: Props) => {
  const { modelList } = props;

  const [isCustomModel, setIsCustomModel] = useState(true);
  const [localSelectedModel, setLocalSelectedModel] = useState<FormattedModel | null>(null);
  const [deleteModel, setDeleteModel] = useState<FormattedModel | null>(null);

  const history = useHistory();
  const dispatch = useDispatch();

  const commandBarItems: ICommandBarItemProps[] = useMemo(
    () => [
      {
        key: 'addBtn',
        text: 'Your Created Models',
        iconProps: isCustomModel ? openIcon : closeIcon,
        onClick: () => setIsCustomModel((prev) => !prev),
      },
    ],
    [isCustomModel],
  );

  const onModelSelect = useCallback((model) => {
    setLocalSelectedModel(model);
  }, []);

  const onModelRedirect = useCallback(
    (modeId: number) => {
      history.push(
        generatePath(Url.MODELS_CUSTOM_VISION_DETAIL, {
          id: modeId,
        }),
      );
    },
    [history],
  );

  const onModelDelete = useCallback(async () => {
    await dispatch(
      deleteTrainingProject({
        id: deleteModel.id,
      }),
    );
    setDeleteModel(null);
  }, [dispatch, deleteModel]);

  return (
    <>
      <Stack>
        <Text styles={{ root: { marginTop: '30px' } }}>
          This is your model workspace. See your added and created models below. You can also view our library
          pre-built models by browsing our model zoo above. Lorem ipsum dolor sit amet, consectetur adipiscing
          elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Text>
        <CommandBar
          items={commandBarItems}
          styles={{
            root: {
              borderTop: `solid 1px ${theme.palette.neutralLight}`,
              margin: '30px 0 15px',
              paddingLeft: 0,
            },
          }}
        />
        {isCustomModel && (
          <Stack tokens={{ childrenGap: 50 }} wrap horizontal>
            {modelList.map((model, id) => (
              <ModelCard
                key={id}
                model={model}
                onModelSelect={onModelSelect}
                onModelRedirect={onModelRedirect}
                // onModelDelete={() => onModelDelete}
                onModelDelete={(inputModel) => setDeleteModel(inputModel)}
                isCustomVisionModel
              />
            ))}
          </Stack>
        )}
      </Stack>
      {!!localSelectedModel && (
        <ModelSidePanel
          model={localSelectedModel}
          onDismiss={() => setLocalSelectedModel(null)}
          onModelRedirect={onModelRedirect}
        />
      )}
      {deleteModel && (
        <DeleteModal
          type="model"
          name={deleteModel.name}
          onDelte={onModelDelete}
          onClose={() => setDeleteModel(null)}
        />
      )}
    </>
  );
};

export default CustomVisionVModelDashboard;
