import { TextField, ITextFieldProps, ITextFieldStyleProps, ITextFieldStyles, styled } from '@fluentui/react';

import { theme } from '../../../constant';

const SidePanelTextField = styled<ITextFieldProps, ITextFieldStyleProps, ITextFieldStyles>(TextField, () => ({
  root: {
    '& .ms-Label': {
      color: theme.palette.neutralSecondaryAlt,
      fontWeight: 400,
    },
  },
}));

export default SidePanelTextField;
