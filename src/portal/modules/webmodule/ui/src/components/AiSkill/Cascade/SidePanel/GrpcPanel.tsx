// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useEffect } from 'react';
import {
  Panel,
  Stack,
  PrimaryButton,
  Text,
  TextField,
  PanelType,
  Dropdown,
  IDropdownOption,
  Label,
  IconButton,
  ITextFieldProps,
  IDropdownProps,
  DefaultButton,
} from '@fluentui/react';
import { Node, Edge } from 'react-flow-renderer';
import { clone, isEmpty } from 'ramda';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { GrpcTransformPanelForm, SkillNodeData } from '../../types';
import { ERROR_BLANK_VALUE, theme } from '../../../../constant';
import { cpuArchitectureOptions, x64AccelerationOptions, arm64AccelerationOptions } from '../../../constant';

import HorizontalTextField from '../Common/HorizontalTextField';
import HorizonChoiceGroup from '../Common/HorizonChoiceGroup';
import HorizontalDropdown from '../Common/HorizontalDropdown';
import LabelTitle from '../Common/LabelTitle';

interface Props {
  node: Node<SkillNodeData>;
  onDismiss: () => void;
  setElements: any;
}

const ERROR_RORT_RANGE = 'Please enter a whole number from 1 to 65535.';
const ERROR_VALID_FORMAT = 'Please enter a valid format.';

type FromType = Omit<GrpcTransformPanelForm, 'port'> & {
  port: number;
};

const typeOptions: IDropdownOption[] = [
  { key: 'container', text: 'Container' },
  { key: 'endpoint', text: 'Endpoint URL' },
];

const restartOptions: IDropdownOption[] = [
  { key: 'always', text: 'always' },
  { key: 'never', text: 'never' },
  { key: 'on-failure', text: 'on-failure' },
  { key: 'on-unhealthy', text: 'on-unhealthy' },
];

const initialValues: FromType = {
  type: '',
  endpoint_url: '',
  container_name: '',
  container_image: '',
  create_options: '',
  restart_policy: 'always',
  port: 0,
  route: '',
  env: [{ key: '', value: '' }],
  architecture: '',
  acceleration: '',
};

const TransformPanel = (props: Props) => {
  const { node, onDismiss, setElements } = props;
  const { data } = node;

  const { reset, control, handleSubmit, watch, formState } = useForm<FromType>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: initialValues,
    resolver: yupResolver(
      yup.object().shape({
        type: yup.string().oneOf(['container', 'endpoint']).required(ERROR_BLANK_VALUE),
        endpoint_url: yup.string().when('type', {
          is: (val) => val === 'endpoint',
          then: yup.string().required(ERROR_BLANK_VALUE),
        }),
        container_name: yup.string().when('type', {
          is: (val) => val === 'container',
          then: yup.string().required(ERROR_BLANK_VALUE),
        }),
        container_image: yup.string().when('type', {
          is: (val) => val === 'container',
          then: yup.string().required(ERROR_BLANK_VALUE),
        }),
        create_options: yup.string().when('type', {
          is: (val) => val === 'container',
          then: yup
            .string()
            .optional()
            .test(function (val) {
              if (isEmpty(val)) return true;

              try {
                const _ = JSON.parse(val);

                return true;
              } catch (e) {
                return this.createError({ message: ERROR_VALID_FORMAT });
              }
            }),
        }),
        restart_policy: yup.string().when('type', {
          is: (val) => val === 'container',
          then: yup.string().oneOf(['always', 'never', 'on-failure', 'on-unhealthy']).required(),
        }),
        port: yup.number().when('type', {
          is: (val) => val === 'container',
          then: yup.number().min(1, ERROR_RORT_RANGE).max(65535, ERROR_RORT_RANGE).required(),
        }),
        route: yup.string().when('type', {
          is: (val) => val === 'container',
          then: yup
            .string()
            .optional()
            .test(function (val) {
              if (isEmpty(val)) return true;

              const regex = new RegExp('^/[a-zA-Z0-9]+');
              if (!regex.test(val)) return this.createError({ message: ERROR_VALID_FORMAT });
              return true;
            }),
        }),
        env: yup.array().when('type', {
          is: (val) => val === 'container',
          then: yup.array().of(
            yup
              .object()
              .shape({
                key: yup.string(),
                value: yup.string(),
              })
              .test(function (val) {
                const { parent, options } = this;
                const { index } = options as any;
                const total = parent.length as number;

                if (Object.keys(val).every((key) => val[key] === '') && total - 1 === index) return true;

                return Object.keys(val).some((key) => val[key] === '')
                  ? this.createError({ path: `${this.path}`, message: ERROR_BLANK_VALUE })
                  : true;
              }),
          ),
        }),
        architecture: yup.string().when('type', {
          is: (val) => val === 'container',
          then: yup.string().oneOf(['X64', 'ARM64']).required(),
        }),
        acceleration: yup.string().when('architecture', {
          is: (val) => val !== '',
          then: yup.string().required(),
        }),
      }),
    ),
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'env',
  });

  const watchType = watch('type');
  const watchArchitecture = watch('architecture');

  useEffect(() => {
    if (data.configurations) {
      reset({ ...initialValues, ...data.configurations, port: parseInt(data.configurations.port, 10) });
    }
  }, [data, reset]);

  const onPanelDone = useCallback(
    (data: FromType) => {
      const configurations: Partial<GrpcTransformPanelForm> = {};
      if (data.type === 'endpoint') {
        configurations.type = data.type;
        configurations.endpoint_url = data.endpoint_url;
      } else {
        configurations.type = data.type;
        configurations.container_name = data.container_name;
        configurations.container_image = data.container_image;
        configurations.create_options = data.create_options;
        configurations.restart_policy = data.restart_policy;
        configurations.port = data.port.toString();
        configurations.route = data.route;
        configurations.endpoint_url = `${data.container_name}:${data.port}${data.route}`;
        // configurations.architecture = data.architecture;
        // configurations.acceleration = data.acceleration;
      }

      setElements((oldElements: (Node<SkillNodeData> | Edge<any>)[]) => {
        const idx = oldElements.findIndex((element) => element.id === node.id);

        const newElements = clone(oldElements);
        newElements.splice(idx, 1, {
          ...oldElements[idx],
          data: { ...oldElements[idx].data, configurations, isEditDone: true },
        });

        return newElements;
      });

      onDismiss();
    },
    [setElements, node, onDismiss],
  );

  return (
    <Panel
      isOpen={true}
      onDismiss={onDismiss}
      hasCloseButton
      headerText="gRPC Custom Processing"
      isFooterAtBottom={true}
      type={PanelType.custom}
      customWidth="800px"
    >
      <Stack
        styles={{ root: { marginTop: '30px', height: 'calc(100vh - 100px)' } }}
        tokens={{ childrenGap: 25 }}
      >
        <Text>
          Use this node to process frames using your own container. You can use your own model and runtime to
          analyze the frames according to your requirements without any limitations.
        </Text>

        <form
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
          }}
          onSubmit={handleSubmit(onPanelDone)}
        >
          <Stack tokens={{ childrenGap: 30 }}>
            <Stack tokens={{ childrenGap: 30 }}>
              <Controller
                control={control}
                name="type"
                render={({ field, fieldState }) => (
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

              {/* Endpoint Url */}
              {watchType === 'endpoint' && (
                <Controller
                  control={control}
                  name="endpoint_url"
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Endpoint URL"
                      onRenderLabel={(props: ITextFieldProps) => <LabelTitle label={props.label} isBold />}
                      onChange={(_, newValue): void => field.onChange(newValue)}
                      value={field.value}
                      errorMessage={fieldState.error?.message}
                      placeholder="Endpoint URL"
                    />
                  )}
                />
              )}
            </Stack>

            {/* Container */}
            {watchType === 'container' && (
              <>
                <Stack tokens={{ childrenGap: 15 }}>
                  <Label>Container info</Label>
                  <Stack tokens={{ childrenGap: 12 }}>
                    <Controller
                      control={control}
                      name="container_name"
                      render={({ field, fieldState }) => (
                        <HorizontalTextField
                          label="Name"
                          onRenderLabel={(props: ITextFieldProps) => <LabelTitle label={props.label} />}
                          onChange={(_, newValue): void => field.onChange(newValue)}
                          value={field.value}
                          errorMessage={fieldState.error?.message}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="container_image"
                      render={({ field, fieldState }) => (
                        <HorizontalTextField
                          label="Image URL"
                          onRenderLabel={(props: ITextFieldProps) => <LabelTitle label={props.label} />}
                          onChange={(_, newValue): void => field.onChange(newValue)}
                          value={field.value}
                          errorMessage={fieldState.error?.message}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="create_options"
                      render={({ field, fieldState }) => (
                        <HorizontalTextField
                          label="Create options"
                          onChange={(_, newValue): void => field.onChange(newValue)}
                          value={field.value}
                          errorMessage={fieldState.error?.message}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="restart_policy"
                      render={({ field, fieldState }) => (
                        <HorizontalDropdown
                          label="Restart policy"
                          onRenderLabel={(props: IDropdownProps) => <LabelTitle label={props.label} />}
                          selectedKey={field.value}
                          onChange={(_, option: IDropdownOption) => field.onChange(option.key)}
                          options={restartOptions}
                          errorMessage={fieldState.error?.message}
                          placeholder="Select one"
                        />
                      )}
                    />
                  </Stack>
                </Stack>
                <Stack tokens={{ childrenGap: 15 }}>
                  <Label>Endpoint info</Label>
                  <Stack tokens={{ childrenGap: 12 }}>
                    <Controller
                      control={control}
                      name="port"
                      render={({ field, fieldState }) => (
                        <HorizontalTextField
                          type="number"
                          label="Port"
                          onRenderLabel={(props: ITextFieldProps) => <LabelTitle label={props.label} />}
                          onChange={(_, newValue): void => field.onChange(newValue)}
                          value={field.value.toString()}
                          errorMessage={fieldState.error?.message}
                          placeholder="Enter number"
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="route"
                      render={({ field, fieldState }) => (
                        <HorizontalTextField
                          label="Route"
                          onChange={(_, newValue): void => field.onChange(newValue)}
                          value={field.value}
                          errorMessage={fieldState.error?.message}
                          placeholder="/GRPC"
                        />
                      )}
                    />
                  </Stack>
                </Stack>
                <Stack tokens={{ childrenGap: 15 }}>
                  <Label>Environment variables</Label>
                  <Stack tokens={{ childrenGap: 8 }}>
                    {fields.map((item, index) => {
                      return (
                        <Stack key={item.id} horizontal tokens={{ childrenGap: 5 }} verticalAlign="center">
                          <Controller
                            name={`env.${index}.key`}
                            control={control}
                            defaultValue={item.value}
                            render={({ field }) => (
                              <TextField
                                onChange={(_, newValue): void => {
                                  field.onChange(newValue);

                                  if (fields.length - 1 === index) append({ key: '', value: '' });
                                }}
                                value={field.value}
                                errorMessage={
                                  Object.keys(formState.errors).some((key) => key === 'env')
                                    ? formState.errors.env[index]?.message
                                    : null
                                }
                                placeholder="Enter name"
                              />
                            )}
                          />
                          <span>:</span>
                          <Controller
                            name={`env.${index}.value`}
                            control={control}
                            defaultValue={item.value}
                            render={({ field }) => (
                              <TextField
                                onChange={(_, newValue): void => field.onChange(newValue)}
                                value={field.value}
                                placeholder="Enter value"
                              />
                            )}
                          />
                          {fields.length - 1 !== index && (
                            <IconButton
                              iconProps={{ iconName: 'Delete' }}
                              onClick={() => fields.length !== 1 && index !== 0 && remove(index)}
                            />
                          )}
                        </Stack>
                      );
                    })}
                  </Stack>
                </Stack>
                <Stack tokens={{ childrenGap: 15 }}>
                  <Label>Constraints</Label>
                  <Stack tokens={{ childrenGap: 8 }}>
                    <Controller
                      control={control}
                      name="architecture"
                      render={({ field, fieldState }) => (
                        <>
                          <HorizonChoiceGroup
                            styles={{
                              root: {
                                alignItems: 'center',
                              },
                              flexContainer: {
                                display: 'flex',
                                '& div:not(:first-child)': {
                                  marginLeft: '30px',
                                },
                              },
                            }}
                            label="CPU Architecture"
                            selectedKey={field.value}
                            options={cpuArchitectureOptions}
                            onChange={(_, option): void => field.onChange(option.key)}
                          />
                          {fieldState.error?.message && (
                            <Text
                              styles={{
                                root: {
                                  color: theme.palette.redDark,
                                  fontSize: '12px',
                                  paddingLeft: '150px',
                                },
                              }}
                            >
                              {ERROR_BLANK_VALUE}
                            </Text>
                          )}
                        </>
                      )}
                    />
                    {watchArchitecture !== '' && (
                      <Controller
                        control={control}
                        name="acceleration"
                        render={({ field, fieldState }) => (
                          <HorizontalDropdown
                            label="Acceleration"
                            onChange={(_, option): void => field.onChange(option.key)}
                            selectedKey={field.value}
                            errorMessage={fieldState.error?.message && ERROR_BLANK_VALUE}
                            options={
                              watchArchitecture === 'X64' ? x64AccelerationOptions : arm64AccelerationOptions
                            }
                          />
                        )}
                      />
                    )}
                  </Stack>
                </Stack>
              </>
            )}
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
