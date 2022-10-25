import { mergeStyleSets } from '@fluentui/react';

import { theme } from '../../constant';

export const getKeuernetesInfoClasses = () =>
  mergeStyleSets({
    fileLabel: { width: '200px', fontWeight: 400 },
    fileForm: {
      width: '306px',
      height: '176px',
      maxWidth: '100%',
      textAlign: 'center',
      position: 'relative',
    },
    fileInput: { display: 'none' },
    formLabel: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: '1px',
      borderRadius: '2px',
      borderStyle: 'solid',
      borderColor: theme.palette.neutralPrimary,
      backgroundColor: theme.palette.neutralLighter,
    },
    icon: {
      color: theme.palette.themeSecondary,
      fontSize: 42,
    },
    text: {
      fontSize: '13px',
      lineHeight: '18px',
      margin: 0,
    },
    errorWrapper: {
      paddingTop: '5px',
    },
    errorMessage: {
      color: theme.palette.redDark,
      fontSize: '12px',
    },
    successMessage: {
      color: '#57A300',
      fontSize: '12px',
    },
    linkText: {
      fontSize: '13px',
      lineHeight: '18px',
      color: theme.palette.themeSecondary,
      textAlign: 'center',
    },
    dragDiv: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      borderRadius: '1rem',
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px',
    },
    errorIcon: {
      fontSize: '16px',
      color: theme.palette.redDark,
    },
    successIcon: {
      fontSize: '16px',
      color: '#57A300',
    },
  });
