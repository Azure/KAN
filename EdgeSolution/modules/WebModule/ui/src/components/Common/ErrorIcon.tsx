import React from 'react';
import { Icon } from '@fluentui/react';

import { theme } from '../../constant';

const ErrorIcon = () => {
  return (
    <Icon
      iconName="StatusErrorFull"
      styles={{ root: { color: theme.palette.redDark, marginRight: '8px', fontSize: '16px' } }}
    />
  );
};

export default ErrorIcon;
