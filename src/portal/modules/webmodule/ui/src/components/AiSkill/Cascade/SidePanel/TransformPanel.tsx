// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useState, useEffect } from 'react';
import { Panel, Stack, PrimaryButton, DefaultButton, Text, TextField } from '@fluentui/react';
import { Node, Edge } from 'react-flow-renderer';
import { clone } from 'ramda';

import { TransformPanelFormData, SkillNodeData } from '../../types';

interface Props {
  node: Node<SkillNodeData>;
  onDismiss: () => void;
  setElements: any;
}

const getParseLables = (labels: string): string[] => {
  return labels.match(/(\S+?)(?:,|$)/g);
};

const ERROR_BLANK_VALUE = 'Value cannot be blank.';

const TransformPanel = (props: Props) => {
  const { node, onDismiss, setElements } = props;
  const { data } = node;

  const [localLabels, setLocalLabels] = useState('');
  const [localForm, setLocalForm] = useState<TransformPanelFormData>({
    labels: [],
    confidence_threshold: 0,
    error: {
      labels: '',
      confidence_threshold: '',
    },
  });

  useEffect(() => {
    if (data.configurations) {
      setLocalForm({
        ...(data.configurations as TransformPanelFormData),
        error: {
          labels: '',
          confidence_threshold: '',
        },
      });
      setLocalLabels(data.configurations.labels.join(', '));
    }
  }, [data]);

  const onFormValidate = useCallback(() => {
    const parseLables = getParseLables(localLabels);

    if (!parseLables.length) {
      setLocalForm((prev) => ({
        ...prev,
        error: { ...prev.error, labels: ERROR_BLANK_VALUE },
      }));
      return true;
    }

    if (localForm.confidence_threshold < 0 && localForm.confidence_threshold > 100) {
      setLocalForm((prev) => ({
        ...prev,
        error: { ...prev.error, confidence_threshold: ERROR_BLANK_VALUE },
      }));
      return true;
    }

    return false;
  }, [localForm, localLabels]);

  const onPanelDone = useCallback(() => {
    if (onFormValidate()) return;

    setElements((oldElements: (Node<any> | Edge<any>)[]) => {
      const idx = oldElements.findIndex((element) => element.id === node.id);

      const newElements = clone(oldElements);
      newElements.splice(idx, 1, {
        ...oldElements[idx],
        data: {
          ...oldElements[idx].data,
          configurations: {
            ...localForm,
            labels: getParseLables(localLabels),
          },
          isEditDone: true,
        },
      });

      return newElements;
    });

    onDismiss();
  }, [setElements, node, localForm, onDismiss, onFormValidate, localLabels]);

  const onRenderFooterContent = useCallback(
    () => (
      <Stack tokens={{ childrenGap: 5 }} horizontal>
        <PrimaryButton onClick={onPanelDone}>Done</PrimaryButton>
        <DefaultButton onClick={onDismiss}>Cancel</DefaultButton>
      </Stack>
    ),
    [onDismiss, onPanelDone],
  );

  return (
    <Panel
      isOpen={true}
      onDismiss={onDismiss}
      hasCloseButton
      headerText="Filter Transform"
      onRenderFooterContent={onRenderFooterContent}
      isFooterAtBottom={true}
    >
      <Stack styles={{ root: { marginTop: '30px' } }} tokens={{ childrenGap: 25 }}>
        <Text>Use this node to tag objects detected by your skill and output the data subset.</Text>
        <TextField
          label="Objects"
          required
          value={localLabels}
          onChange={(_, value): void => {
            setLocalForm((prev) => ({ ...prev, error: { ...localForm.error, labels: '' } }));
            setLocalLabels(value);
          }}
          placeholder="object1, object2, etc."
          errorMessage={localForm.error.labels}
        />
        <TextField
          label="Confidence Threshold"
          required
          value={localForm.confidence_threshold.toString()}
          onChange={(_, newValue): void => {
            setLocalForm((prev) => ({
              ...prev,
              confidence_threshold: Number.isInteger(+newValue) ? +newValue : prev.confidence_threshold,
              error: { ...localForm.error, confidence_threshold: '' },
            }));
          }}
          errorMessage={localForm.error.confidence_threshold}
          placeholder="0-100"
        />
      </Stack>
    </Panel>
  );
};

export default TransformPanel;
