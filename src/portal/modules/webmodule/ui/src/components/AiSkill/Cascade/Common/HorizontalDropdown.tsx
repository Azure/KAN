// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Dropdown, IDropdownProps, IDropdownStyleProps, IDropdownStyles, styled } from '@fluentui/react';

const HorizontalDropdown = styled<IDropdownProps, IDropdownStyleProps, IDropdownStyles>(Dropdown, () => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    '& .ms-Label': {
      width: '150px',
      fontWeight: 400,
    },
  },
  dropdown: { flexGrow: 1 },
  errorMessage: { width: '100%', paddingLeft: '150px' },
}));

export default HorizontalDropdown;
