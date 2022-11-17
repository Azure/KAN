// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TextField, ITextFieldProps, ITextFieldStyleProps, ITextFieldStyles, styled } from '@fluentui/react';

import { theme } from '../../../../constant';

const HorizontalTextField = styled<ITextFieldProps, ITextFieldStyleProps, ITextFieldStyles>(
  TextField,
  () => ({
    root: {
      '& .ms-Label': {
        width: '150px',
        fontWeight: 400,
        color: theme.palette.neutralPrimary,
      },
    },
    fieldGroup: { flexGrow: 1 },
    wrapper: { display: 'flex' },
    errorMessage: { paddingLeft: '150px' },
  }),
);

export default HorizontalTextField;
