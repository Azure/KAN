// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useEffect } from 'react';
import {
  Panel,
  Stack,
  PrimaryButton,
  DefaultButton,
  Text,
  TextField,
  ITextFieldProps,
} from '@fluentui/react';
import { Node, Edge } from 'react-flow-renderer';
import { clone, isEmpty } from 'ramda';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { FilterTransformPanelForm, SkillNodeData } from '../../types';
import { ERROR_BLANK_VALUE } from '../../../../constant';

import LabelTitle from '../Common/LabelTitle';

interface Props {
  node: Node<SkillNodeData>;
  onDismiss: () => void;
  setElements: any;
}

type FormData = Pick<FilterTransformPanelForm, 'labels'> & {
  confidence_threshold: number;
};

const ERROR_CONFIDENCE_THRESHOLD_RANGE = 'Please enter a whole number from 0 to 100.';
const getParseLables = (labels: string): string[] => {
  return labels.split(/[\s,]+/);
};

const initialValues = {
  labels: '',
  confidence_threshold: 0,
};

const TransformPanel = (props: Props) => {
  const { node, onDismiss, setElements } = props;
  const { data } = node;

  const { reset, control, handleSubmit } = useForm<FormData>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: initialValues,
    resolver: yupResolver(
      yup.object().shape({
        labels: yup.string().test('test', function (val) {
          if (isEmpty(val)) return this.createError({ message: ERROR_BLANK_VALUE });

          const parseLables = getParseLables(val);
          if (!parseLables.length) return this.createError({ message: ERROR_BLANK_VALUE });
          return true;
        }),
        confidence_threshold: yup
          .number()
          .integer()
          .min(0, ERROR_CONFIDENCE_THRESHOLD_RANGE)
          .max(100, ERROR_CONFIDENCE_THRESHOLD_RANGE)
          .typeError(ERROR_BLANK_VALUE)
          .required(ERROR_BLANK_VALUE),
      }),
    ),
  });

  useEffect(() => {
    if (data.configurations) {
      reset({
        labels: JSON.parse(data.configurations.labels).join(', '),
        confidence_threshold: parseInt(data.configurations.confidence_threshold, 10),
      });
    }
  }, [data, reset]);

  const onPanelDone = useCallback(
    (data: FormData) => {
      const configurations: Partial<FilterTransformPanelForm> = {
        labels: JSON.stringify(getParseLables(data.labels)),
        confidence_threshold: data.confidence_threshold.toString(),
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
                  errorMessage={fieldState.error?.message}
                  onRenderLabel={(props: ITextFieldProps) => (
                    <LabelTitle label={props.label} isHorizontal isBold />
                  )}
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
                  value={field.value.toString()}
                  onChange={(_, newValue): void => field.onChange(newValue)}
                  errorMessage={fieldState.error?.message}
                  placeholder="0-100"
                  onRenderLabel={(props: ITextFieldProps) => (
                    <LabelTitle label={props.label} isHorizontal isBold />
                  )}
                />
              )}
            />
          </Stack>

          <Stack
            styles={{ root: { padding: '16px 0 0' } }}
            tokens={{ childrenGap: 10 }}
            verticalAlign="center"
            horizontal
          >
            <PrimaryButton type="submit">Done</PrimaryButton>
            <DefaultButton styles={{ root: { marginTop: 0 } }} onClick={onDismiss}>
              Cancel
            </DefaultButton>
          </Stack>
        </form>
      </Stack>
    </Panel>
  );
};

export default TransformPanel;
