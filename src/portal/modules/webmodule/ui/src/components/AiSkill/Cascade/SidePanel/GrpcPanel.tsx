// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useState, useEffect } from 'react';
import {
  Panel,
  Stack,
  PrimaryButton,
  DefaultButton,
  Text,
  TextField,
  PanelType,
  Dropdown,
  IDropdownOption,
} from '@fluentui/react';
import { Node, Edge } from 'react-flow-renderer';
import { clone } from 'ramda';
import { Controller, useForm } from 'react-hook-form';

import { GrpcTransformPanelForm, SkillNodeData } from '../../types';
import { ERROR_BLANK_VALUE } from '../../../../constant';

interface Props {
  node: Node<SkillNodeData>;
  onDismiss: () => void;
  setElements: any;
}

// const ERROR_BLANK_VALUE = 'Value cannot be blank.';

export const typeOptions: IDropdownOption[] = [
  { key: '', text: '' },
  { key: 'container', text: 'Container' },
  { key: 'endpoint', text: 'Endpoint URL' },
];

const TransformPanel = (props: Props) => {
  const { node, onDismiss, setElements } = props;
  const { data } = node;

  // const [localLabels, setLocalLabels] = useState('');
  // const [localForm, setLocalForm] = useState<GrpcTransformPanelForm>({
  //   type: '',
  //   enpointUrl: '',
  //   error: {
  //     type: '',
  //     enpointUrl: '',
  //   },
  // });

  // const { control, handleSubmit, errors } = useForm<FormData>({
  //   mode: 'onSubmit',
  //   reValidateMode: 'onChange',
  //   defaultValues: {
  //     name: camera.name,
  //     model_name: camera.model_name,
  //     rtsp: camera.rtsp,
  //   },
  // })

  const {
    reset,
    control,
    handleSubmit,
    // formState: { isValid },
    watch,
  } = useForm<GrpcTransformPanelForm>({
    mode: 'onSubmit',
    defaultValues: {
      type: '',
      enpointUrl: '',
    },
  });

  const watchType = watch('type');

  // useEffect(() => {
  //   if (data.configurations) {
  //     setLocalForm({
  //       ...(data.configurations as GrpcTransformPanelForm),
  //       error: {
  //         type: '',
  //         enpointUrl: '',
  //       },
  //     });
  //     setLocalLabels(data.configurations.labels.join(', '));
  //   }
  // }, [data]);

  // const onFormValidate = useCallback(() => {
  //   const parseLables = getParseLables(localLabels);

  //   if (!parseLables.length) {
  //     setLocalForm((prev) => ({
  //       ...prev,
  //       error: { ...prev.error, labels: ERROR_BLANK_VALUE },
  //     }));
  //     return true;
  //   }

  //   if (localForm.confidence_threshold < 0 && localForm.confidence_threshold > 100) {
  //     setLocalForm((prev) => ({
  //       ...prev,
  //       error: { ...prev.error, confidence_threshold: ERROR_BLANK_VALUE },
  //     }));
  //     return true;
  //   }

  //   return false;
  // }, [localForm, localLabels]);

  // const onPanelDone = useCallback(() => {
  //   // if (onFormValidate()) return;

  //   setElements((oldElements: (Node<any> | Edge<any>)[]) => {
  //     const idx = oldElements.findIndex((element) => element.id === node.id);

  //     const newElements = clone(oldElements);
  //     newElements.splice(idx, 1, {
  //       ...oldElements[idx],
  //       data: {
  //         ...oldElements[idx].data,
  //         configurations: {
  //           ...localForm,
  //           labels: getParseLables(localLabels),
  //         },
  //         isEditDone: true,
  //       },
  //     });

  //     return newElements;
  //   });

  //   onDismiss();
  // }, [setElements, node, localForm, onDismiss, onFormValidate, localLabels]);

  const onApply = useCallback((data) => {
    console.log('data', data);
  }, []);

  const onRenderFooterContent = useCallback(
    () => (
      <Stack tokens={{ childrenGap: 5 }} horizontal>
        <label htmlFor="submit-form">Submit</label>
        <label htmlFor="submit-form">
          <PrimaryButton>Done</PrimaryButton>
        </label>
        <PrimaryButton
          as="Label"
          type="submit"
          htmlFor="submit-form"
          onClick={() => console.log('submit-form click')}
        >
          Done
        </PrimaryButton>
        <DefaultButton onClick={onDismiss}>Cancel</DefaultButton>
      </Stack>
    ),
    [onDismiss],
  );

  return (
    <Panel
      isOpen={true}
      onDismiss={onDismiss}
      hasCloseButton
      headerText="gRPC custom processing"
      onRenderFooterContent={onRenderFooterContent}
      isFooterAtBottom={true}
      type={PanelType.medium}
    >
      <Stack styles={{ root: { marginTop: '30px' } }} tokens={{ childrenGap: 25 }}>
        <Text>
          Use this node to process frames using your own container. You can use your own model and runtime to
          analyze the frames according to your requirements without any limitations.
        </Text>

        <form onSubmit={handleSubmit(onApply)}>
          <Controller
            control={control}
            name="type"
            rules={{ validate: (value) => (value !== '' ? true : ERROR_BLANK_VALUE), required: true }}
            render={({ field, fieldState, formState }) => (
              <Dropdown
                label="Type"
                selectedKey={field.value}
                onChange={(_, option: IDropdownOption) => field.onChange(option.key)}
                options={typeOptions}
                required
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          {watchType === 'endpoint' && (
            <Controller
              control={control}
              name="enpointUrl"
              rules={{ validate: (value) => (value !== '' ? true : ERROR_BLANK_VALUE), required: true }}
              render={({ field, fieldState, formState }) => (
                <TextField
                  label="Endpoint URL"
                  required
                  value={field.value}
                  onChange={(_, newValue): void => field.onChange(newValue)}
                  placeholder="Endpoint URL"
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          )}

          <PrimaryButton type="submit">Done</PrimaryButton>
        </form>

        {/* <TextField
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
        /> */}
        {/* {data.transformType === 'filter' ? (
          <>
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
          </>
        ) : (
          <>
            <Text>{getPanelDescirbtion(data.transformType)}</Text>
            <TextField
              label="Communication Type"
              required
              value={localForm.communication_type}
              onChange={(_, newValue): void => {
                setLocalForm((prev) => ({
                  ...prev,
                  communication_type: newValue,
                  error: { ...localForm.error, communication_type: '' },
                }));
              }}
              errorMessage={localForm.error.communication_type}
            />
            <TextField
              label="Endpoint URL"
              required
              value={localForm.enpointUrl}
              onChange={(_, newValue): void => {
                setLocalForm((prev) => ({
                  ...prev,
                  enpointUrl: newValue,
                  error: { ...localForm.error, enpointUrl: '' },
                }));
              }}
              errorMessage={localForm.error.enpointUrl}
            />
            <TextField
              label="Container Image URL"
              required
              value={localForm.imageUrl}
              onChange={(_, newValue): void => {
                setLocalForm((prev) => ({
                  ...prev,
                  imageUrl: newValue,
                  error: { ...localForm.error, imageUrl: '' },
                }));
              }}
              errorMessage={localForm.error.imageUrl}
            />
            <TextField
              label="Credentials"
              required
              value={localForm.credentials}
              onChange={(_, newValue): void => {
                setLocalForm((prev) => ({
                  ...prev,
                  credentials: newValue,
                  error: { ...localForm.error, credentials: '' },
                }));
              }}
              errorMessage={localForm.error.credentials}
              multiline
            />
          </>
        )} */}
      </Stack>
    </Panel>
  );
};

export default TransformPanel;
