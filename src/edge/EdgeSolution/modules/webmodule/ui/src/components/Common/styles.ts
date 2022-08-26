import { mergeStyleSets } from '@fluentui/react';

export const getFooterClasses = () =>
  mergeStyleSets({
    root: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      padding: '15px',
      borderTop: '1px solid rgba(204,204,204,0.8)',
      width: '100%',
    },
    warningFooter: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      padding: '15px',
      width: '100%',
      backgroundColor: '#FFF4CE',
    },
  });
