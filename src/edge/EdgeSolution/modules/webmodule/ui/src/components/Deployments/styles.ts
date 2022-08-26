import { mergeStyleSets } from '@fluentui/react';

export const wrapperPadding = { padding: '35px 20px 0' };

export const getDeploymentWrapperClasses = () =>
  mergeStyleSets({
    root: wrapperPadding,
  });
