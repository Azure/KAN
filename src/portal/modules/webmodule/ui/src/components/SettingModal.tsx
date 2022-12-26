// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Modal,
  Stack,
  TextField,
  mergeStyleSets,
  // MessageBar,
  // MessageBarType,
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
  // updateNamespace,
  // updateKey,
  // thunkPostSetting,
  thunkGetAllCvProjects,
  updateSetting,
} from '../store/setting/settingAction';
import { ERROR_BLANK_VALUE, theme } from '../constant';

interface Props {
  isModalOpen: boolean;
  onModalClose: () => void;
  canBeDismissed: boolean;
  showProjectDropdown: boolean;
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

// const NormalLabel = (props: ITextFieldProps): JSX.Element => {
//   return (
//     <Stack horizontal verticalAlign="center">
//       <Label styles={{ root: { fontWeight: 400 } }} required={props.required}>
//         {props.label}
//       </Label>
//       <IconButton iconProps={{ iconName: 'Info' }} />
//     </Stack>
//   );
// };

type FormData = {
  training_key: string;
  endpoint: string;
  subscription_id: string;
  storage_account: string;
  storage_container: string;
  tenant_id: string;
  client_id: string;
  client_secret: string;
};

const SettingModal = (props: Props) => {
  const { isModalOpen, onModalClose, canBeDismissed, showProjectDropdown } = props;

  const settingData = useSelector((state: RootState) => state.setting);
  // const originSettingData = useSelector((state: RootState) => state.setting.origin);
  // const error = useSelector((state: RootState) => state.setting.error);

  // const dontNeedUpdateOrSave = equals(settingData, originSettingData);
  const [loading, setLoading] = useState(false);

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
      training_key: settingData.training_key,
      endpoint: settingData.endpoint,
    },
    resolver: yupResolver(
      yup.object().shape({
        tenant_id: yup.string().required(ERROR_BLANK_VALUE),
        client_id: yup.string().required(ERROR_BLANK_VALUE),
        client_secret: yup.string().required(ERROR_BLANK_VALUE),
        storage_account: yup.string().required(ERROR_BLANK_VALUE),
        storage_container: yup.string().required(ERROR_BLANK_VALUE),
        subscription_id: yup.string().required(ERROR_BLANK_VALUE),
        training_key: yup.string().required(ERROR_BLANK_VALUE),
        endpoint: yup.string().required(ERROR_BLANK_VALUE),
      }),
    ),
  });

  const classes = getClasses();
  const dispatch = useDispatch();

  useEffect(() => {
    if (showProjectDropdown) dispatch(thunkGetAllCvProjects());
  }, [dispatch, showProjectDropdown]);

  useEffect(() => {
    dispatch(checkSettingStatus());
  }, [dispatch]);

  // const onConfirm = useCallback(async () => {
  //   try {
  //     setLoading(true);

  //     await dispatch(thunkPostSetting());

  //     setLoading(false);
  //     onModalClose();
  //   } catch (e) {
  //     alert(e);
  //   }
  // }, [dispatch, onModalClose]);

  const onFormDone = useCallback(
    async (data: FormData) => {
      setLoading(true);

      await dispatch(updateSetting(data));

      setLoading(false);
    },
    [dispatch],
  );

  return (
    <Modal
      isOpen={isModalOpen}
      onDismiss={onModalClose}
      isBlocking={true}
      styles={{ scrollableContent: classes.scrollableContent }}
    >
      <form onSubmit={handleSubmit(onFormDone)}>
        <Stack tokens={{ childrenGap: 25 }}>
          <Stack horizontal verticalAlign="center" horizontalAlign="space-between">
            <Label styles={{ root: classes.title }}>Settings</Label>
            <IconButton
              iconProps={{ iconName: 'Cancel' }}
              onClick={onModalClose}
              disabled={!showProjectDropdown}
            />
          </Stack>
          <Text styles={{ root: classes.describe }}>
            These settings are autofilled with your credentials.
          </Text>
          <Stack tokens={{ childrenGap: 12 }}>
            <h4 className={classes.sbutTitle}>Service Principal Settings</h4>
            <Controller
              control={control}
              name="tenant_id"
              render={({ field, fieldState }) => (
                <HorizontalTextField
                  label="tenantId"
                  value={field.value}
                  onChange={(_, newValue): void => field.onChange(newValue)}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="client_id"
              render={({ field, fieldState }) => (
                <HorizontalTextField
                  label="clientId"
                  value={field.value}
                  onChange={(_, newValue): void => field.onChange(newValue)}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="client_secret"
              render={({ field, fieldState }) => (
                <HorizontalTextField
                  type="password"
                  canRevealPassword
                  label="clientSecret"
                  value={field.value}
                  onChange={(_, newValue): void => field.onChange(newValue)}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
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

          <Stack horizontal tokens={{ childrenGap: 10 }}>
            <PrimaryButton type="submit" text="Save" />
            {showProjectDropdown && <DefaultButton text="Cancel" onClick={onModalClose} />}
          </Stack>
        </Stack>
      </form>
    </Modal>
  );
};

export default SettingModal;
