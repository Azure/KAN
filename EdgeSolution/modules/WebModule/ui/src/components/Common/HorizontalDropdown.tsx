import { Dropdown, IDropdownProps, IDropdownStyleProps, IDropdownStyles, styled } from '@fluentui/react';

const HorizontalDropdown = styled<IDropdownProps, IDropdownStyleProps, IDropdownStyles>(Dropdown, () => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    '& .ms-Label': {
      width: '200px',
      fontWeight: 400,
    },
  },
  dropdown: { width: '480px' },
  errorMessage: { width: '100%', paddingLeft: '200px' },
}));

export default HorizontalDropdown;
