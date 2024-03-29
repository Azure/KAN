import { mergeStyleSets } from '@fluentui/react';

import { theme } from '../../constant';

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

export const getScrllStackClasses = () =>
  mergeStyleSets({
    root: {
      height: 'calc(100% - 150px)',
      overflowY: 'auto',
      overflowX: 'hidden',
    },
  });

export const getPropertyClasses = () =>
  mergeStyleSets({
    root: {
      paddingTop: '25px',
      whiteSpace: 'pre',
      color: theme.palette.black,
      fontSize: '13px',
      lineHeight: '18px',
      overflow: 'auto',
    },
  });
