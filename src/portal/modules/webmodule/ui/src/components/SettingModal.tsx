// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Modal,
  Stack,
  TextField,
  mergeStyleSets,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  DefaultButton,
  styled,
  ITextFieldProps,
  ITextFieldStyleProps,
  ITextFieldStyles,
  Label,
  IconButton,
  Text,
} from '@fluentui/react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { State as RootState } from 'RootStateType';
import {
  checkSettingStatus,
  updateSetting,
  //  thunkGetAllCvProjects
} from '../store/setting/settingAction';
import { theme } from '../constant';

interface Props {
  onModalClose: () => void;
}

const getClasses = () =>
  mergeStyleSets({
    scrollableContent: { width: '1080px', padding: '25px' },
    title: { fontSize: '20px', lineHeight: '24px', fontWeight: 600 },
    describe: { fontSize: '13px', lineHeight: '18px', fontWeight: 400 },
    sbutTitle: { fontSize: '14px', lineHeight: '24px', fontWeight: 600 },
  });

const HorizontalTextField = styled<ITextFieldProps, ITextFieldStyleProps, ITextFieldStyles>(
  TextField,
  () => ({
    root: {
      '& .ms-Label': {
        fontWeight: 400,
        width: '200px',
        color: theme.palette.neutralPrimary,
      },
    },
    wrapper: { display: 'flex' },
    fieldGroup: { width: '480px' },
    errorMessage: { paddingLeft: '200px' },
  }),
);

type FormData = {
  training_key: string;
  endpoint: string;
  subscription_id: string;
  storage_account: string;
  storage_container: string;
  storage_resource_group: string;
  tenant_id: string;
  client_id: string;
  client_secret: string;
  openai_api_key: string;
};

const SettingModal = (props: Props) => {
  const { onModalClose } = props;

  const settingData = useSelector((state: RootState) => state.setting);

  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const { control, handleSubmit } = useForm<FormData>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      tenant_id: settingData.tenant_id,
      client_id: settingData.client_id,
      client_secret: settingData.client_secret,
      subscription_id: settingData.subscription_id,
      storage_account: settingData.storage_account,
      storage_container: settingData.storage_container,
      storage_resource_group: settingData.storage_resource_group,
      training_key: settingData.training_key,
      endpoint: settingData.endpoint,
      openai_api_key: settingData.openai_api_key
    },
    resolver: yupResolver(
      yup.object().shape({
        tenant_id: yup.string().optional(),
        client_id: yup.string().optional(),
        client_secret: yup.string().optional(),
        storage_account: yup.string().optional(),
        storage_container: yup.string().optional(),
        subscription_id: yup.string().optional(),
        storage_resource_group: yup.string().optional(),
        training_key: yup.string().optional(),
        endpoint: yup.string().optional(),
        openai_api_key: yup.string().optional()
      }),
    ),
  });

  const classes = getClasses();
  const dispatch = useDispatch();

  // useEffect(() => {
  //   dispatch(thunkGetAllCvProjects());
  // }, [dispatch]);

  useEffect(() => {
    dispatch(checkSettingStatus());
  }, [dispatch]);

  const onFormDone = useCallback(
    async (data: FormData) => {
      setLoading(true);

      const errorResponse = await dispatch(updateSetting(data));
      if (errorResponse) {
        setIsError(true);
      }

      setLoading(false);
      if (!errorResponse) {
        onModalClose();
      }
    },
    [dispatch, onModalClose],
  );

  return (
    <Modal
      isOpen={true}
      onDismiss={onModalClose}
      isBlocking={true}
      styles={{ scrollableContent: classes.scrollableContent }}
    >
      <form onSubmit={handleSubmit(onFormDone)}>
        <Stack tokens={{ childrenGap: 25 }}>
          <Stack horizontal verticalAlign="center" horizontalAlign="space-between">
            <Label styles={{ root: classes.title }}>Settings</Label>
            <IconButton iconProps={{ iconName: 'Cancel' }} onClick={onModalClose} disabled={loading} />
          </Stack>
          <Text styles={{ root: classes.describe }}>
            These settings are autofilled with your credentials.
          </Text>
          <Stack tokens={{ childrenGap: 12 }}>
            <h4 className={classes.sbutTitle}>Service Principal Settings</h4>
            <Controller
              control={control}
              name="tenant_id"
              render={({ field }) => (
                <HorizontalTextField
                  label="tenantId"
                  value={field.value}
                  onChange={(_, newValue): void => {
                    field.onChange(newValue);
                    setIsError(false);
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="client_id"
              render={({ field }) => (
                <HorizontalTextField
                  label="clientId"
                  value={field.value}
                  onChange={(_, newValue): void => {
                    field.onChange(newValue);
                    setIsError(false);
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="client_secret"
              render={({ field }) => (
                <HorizontalTextField
                  type="password"
                  canRevealPassword
                  label="clientSecret"
                  value={field.value}
                  onChange={(_, newValue): void => {
                    field.onChange(newValue);
                    setIsError(false);
                  }}
                />
              )}
            />
            {isError && (
              <MessageBar messageBarType={MessageBarType.error}>
                Invalid service principal settings
              </MessageBar>
            )}
          </Stack>
          <Stack tokens={{ childrenGap: 12 }}>
            <h4 className={classes.sbutTitle}>Azure Storage Settings</h4>

            <Controller
              control={control}
              name="storage_account"
              render={({ field, fieldState }) => (
                <HorizontalTextField
                  label="storageAccount"
                  value={field.value}
                  onChange={(_, newValue): void => field.onChange(newValue)}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="storage_container"
              render={({ field, fieldState }) => (
                <HorizontalTextField
                  label="storageContainer"
                  value={field.value}
                  onChange={(_, newValue): void => field.onChange(newValue)}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="subscription_id"
              render={({ field, fieldState }) => (
                <HorizontalTextField
                  label="subscriptionId"
                  value={field.value}
                  onChange={(_, newValue): void => field.onChange(newValue)}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="storage_resource_group"
              render={({ field, fieldState }) => (
                <HorizontalTextField
                  label="storage resource group"
                  value={field.value}
                  onChange={(_, newValue): void => field.onChange(newValue)}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          </Stack>
          <Stack tokens={{ childrenGap: 12 }}>
            <h4 className={classes.sbutTitle}>Azure Cognitive Services Settings</h4>

            <Controller
              control={control}
              name="endpoint"
              render={({ field, fieldState }) => (
                <HorizontalTextField
                  label="Endpoint"
                  value={field.value}
                  onChange={(_, newValue): void => field.onChange(newValue)}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="training_key"
              render={({ field, fieldState }) => (
                <HorizontalTextField
                  label="Key"
                  type="password"
                  canRevealPassword
                  value={field.value}
                  onChange={(_, newValue): void => field.onChange(newValue)}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          </Stack>

          <Stack tokens={{ childrenGap: 12 }}>
            <h4 className={classes.sbutTitle}>Open AI Settings</h4>

            <Controller
              control={control}
              name="openai_api_key"
              render={({ field, fieldState }) => (
                <HorizontalTextField
                  label="Key"
                  type="password"
                  canRevealPassword
                  value={field.value}
                  onChange={(_, newValue): void => field.onChange(newValue)}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 10 }}>
            <PrimaryButton type="submit" text="Save" disabled={loading} />
            <DefaultButton text="Cancel" onClick={onModalClose} disabled={loading} />
            {/* {showProjectDropdown && <DefaultButton text="Cancel" onClick={onModalClose} disabled={loading} />} */}
          </Stack>
        </Stack>
      </form>
    </Modal>
  );
};

export default SettingModal;
