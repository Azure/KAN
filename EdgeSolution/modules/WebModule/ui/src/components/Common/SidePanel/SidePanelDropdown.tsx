import { Dropdown, IDropdownProps, IDropdownStyleProps, IDropdownStyles, styled } from '@fluentui/react';

import { theme } from '../../../constant';

const SidePanelDropdown = styled<IDropdownProps, IDropdownStyleProps, IDropdownStyles>(Dropdown, () => ({
  root: {
    label: {
      color: theme.palette.neutralSecondaryAlt,
      fontWeight: 400,
    },
  },
}));

export default SidePanelDropdown;
