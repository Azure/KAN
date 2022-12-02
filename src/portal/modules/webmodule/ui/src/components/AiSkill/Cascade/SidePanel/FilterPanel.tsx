// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useEffect } from 'react';
import { Panel, Stack, PrimaryButton, DefaultButton, Text, TextField } from '@fluentui/react';
import { Node, Edge } from 'react-flow-renderer';
import { clone } from 'ramda';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { FilterTransformPanelForm, SkillNodeData } from '../../types';
import { ERROR_BLANK_VALUE } from '../../../../constant';

interface Props {
  node: Node<SkillNodeData>;
  onDismiss: () => void;
  setElements: any;
}

const getParseLables = (labels: string): string[] => {
  return labels.match(/(\S+?)(?:,|$)/g);
};

const initialValues = {
  labels: '',
  confidence_threshold: '0',
};

const TransformPanel = (props: Props) => {
  const { node, onDismiss, setElements } = props;
  const { data } = node;

  const { reset, control, handleSubmit } = useForm<FilterTransformPanelForm>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: initialValues,
    resolver: yupResolver(
      yup.object().shape({
        labels: yup.string().test('test', function (val) {
          const parseLables = getParseLables(val);

          if (!parseLables.length) return false;
          return true;
        }),
        confidence_threshold: yup.number().integer().min(0).max(100).required(),
      }),
    ),
  });

  useEffect(() => {
    if (data.configurations) {
      reset({
        labels: JSON.parse(data.configurations.labels).join(', '),
        confidence_threshold: data.configurations.confidence_threshold.toString(),
      });
    }
  }, [data, reset]);

  const onPanelDone = useCallback(
    (data: FilterTransformPanelForm) => {
      const configurations: Partial<FilterTransformPanelForm> = {
        confidence_threshold: data.confidence_threshold.toString(),
        labels: JSON.stringify(getParseLables(data.labels)),
      };

      setElements((oldElements: (Node<any> | Edge<any>)[]) => {
        const idx = oldElements.findIndex((element) => element.id === node.id);

        const newElements = clone(oldElements);
        newElements.splice(idx, 1, {
          ...oldElements[idx],
          data: {
            ...oldElements[idx].data,
            configurations,
            isEditDone: true,
          },
        });

        return newElements;
      });

      onDismiss();
    },
    [setElements, node, onDismiss],
  );

  return (
    <Panel isOpen={true} onDismiss={onDismiss} hasCloseButton headerText="Filter Transform">
      <Stack
        styles={{ root: { marginTop: '30px', height: 'calc(100vh - 100px)' } }}
        tokens={{ childrenGap: 25 }}
      >
        <Text>Use this node to tag objects detected by your skill and output the data subset.</Text>

        <form
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
          }}
          onSubmit={handleSubmit(onPanelDone)}
        >
          <Stack tokens={{ childrenGap: 25 }}>
            <Controller
              control={control}
              name="labels"
              render={({ field, fieldState }) => (
                <TextField
                  label="Objects"
                  value={field.value}
                  onChange={(_, newValue): void => field.onChange(newValue)}
                  placeholder="object1, object2, etc."
                  errorMessage={fieldState.error?.message && ERROR_BLANK_VALUE}
                />
              )}
            />
            <Controller
              control={control}
              name="confidence_threshold"
              render={({ field, fieldState }) => (
                <TextField
                  type="number"
                  label="Confidence Threshold"
                  required
                  value={field.value}
                  onChange={(_, newValue): void => field.onChange(newValue)}
                  errorMessage={fieldState.error?.message && ERROR_BLANK_VALUE}
                  placeholder="0-100"
                />
              )}
            />
          </Stack>

          <Stack styles={{ root: { padding: '16px 0', display: 'block' } }} tokens={{ childrenGap: 5 }}>
            <PrimaryButton type="submit">Done</PrimaryButton>
            <DefaultButton onClick={onDismiss}>Cancel</DefaultButton>
          </Stack>
        </form>
      </Stack>
    </Panel>
  );
};

export default TransformPanel;
