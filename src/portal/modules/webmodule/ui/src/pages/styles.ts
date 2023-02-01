import { mergeStyleSets } from '@fluentui/react';

import { theme } from '../constant';

export const getPageClasses = () =>
  mergeStyleSets({
    section: { height: 'calc(100% - 35px)', padding: '35px 20px 0', position: 'relative' },
    alignCenterSection: {
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    process: {
      width: '500px',
    },
    pageTitleWrapper: {},
    pageTitle: { fontSize: '24px', lineHeight: '32px', color: theme.palette.neutralPrimary },
  });

export const getCameraLiveFeedClasses = () =>
  mergeStyleSets({
    section: { height: 'calc(100% - 35px)', padding: '35px 20px 0', position: 'relative' },
    label: { fontSize: '24px', lineHeight: '32px', color: theme.palette.neutralPrimary },
    buttonWrapper: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      height: '50px',
      borderTop: '1px solid #cccccc',
      width: '100%',
      padding: '10px 20px',
    },
    button: { width: '205px' },
  });
