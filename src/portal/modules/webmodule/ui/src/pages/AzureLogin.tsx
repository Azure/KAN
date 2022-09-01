// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useCallback, useMemo } from 'react';
import { AccountInfo } from '@azure/msal-browser';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { Status } from '../store/project/projectTypes';

import AzureAuthenticationContext from '../azure/azure-authentication-context';
import { Url } from '../constant';

type EnhanceAccountInfo = AccountInfo & {
  idTokenClaims: {
    oid: string;
  };
};

const AzureLogin = (): JSX.Element => {
  const authenticationModule: AzureAuthenticationContext = useMemo(
    () => new AzureAuthenticationContext(),
    [],
  );
  const history = useHistory();

  const projectHasConfigured = useSelector((state: RootState) => state.project.status !== Status.None);

  const returnedAccountInfo = useCallback(
    (user: EnhanceAccountInfo) => {
      localStorage.setItem('azure_token', user.idTokenClaims.oid);

      history.push(projectHasConfigured ? Url.DEPLOYMENT : Url.HOME);
    },
    [history, projectHasConfigured],
  );

  useEffect(() => {
    if (!authenticationModule.isAuthenticationConfigured) {
      console.error('Authentication Client ID is not configured.');
      return;
    }
    authenticationModule.login('loginPopup', returnedAccountInfo);
  }, [authenticationModule, returnedAccountInfo]);

  return <></>;
};

export default AzureLogin;
