// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TextField, ITextFieldProps, ITextFieldStyleProps, ITextFieldStyles, styled } from '@fluentui/react';

import { theme } from '../../constant';

const HorizontalTextField = styled<ITextFieldProps, ITextFieldStyleProps, ITextFieldStyles>(
  TextField,
  () => ({
    root: {
      '& .ms-Label': {
        width: '200px',
        fontWeight: 400,
        color: theme.palette.neutralPrimary,
      },
    },
    wrapper: { display: 'flex' },
    field: { width: '480px' },
    errorMessage: { paddingLeft: '200px' },
  }),
);

export default HorizontalTextField;
