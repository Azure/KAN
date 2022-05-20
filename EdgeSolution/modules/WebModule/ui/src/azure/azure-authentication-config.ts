import { Configuration, LogLevel } from '@azure/msal-browser';

const AzureActiveDirectoryAppClientId: any = process.env.REACT_APP_AZURE_ACTIVE_DIRECTORY_APP_CLIENT_ID;
const AzureActiveDirectoryAppTenantId = process.env.REACT_APP_AZURE_ACTIVE_DIRECTORY_APP_TENANT_ID;

export const MSAL_CONFIG: Configuration = {
  auth: {
    clientId: AzureActiveDirectoryAppClientId,
    authority: `https://login.microsoftonline.com/${AzureActiveDirectoryAppTenantId}`,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: true,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
    },
  },
};
