import { mergeStyleSets } from '@fluentui/react';

export const getSelectModelToolTipClasses = () =>
  mergeStyleSets({
    lable: { fontWeight: 600 },
    contentWrapper: { padding: '17px 25px', display: 'inline-block' },
    boldContent: { fontSize: '13px', fontWeight: 600 },
    content: { fontSize: '13px' },
    requiredMark: {
      color: 'rgb(164, 38, 44)',
      paddingRight: '12px',
    },
  });

export const getDelayBufferToolTipClasses = () =>
  mergeStyleSets({
    lable: { fontWeight: 600 },
    contentWrapper: { padding: '17px 25px' },
    content: { fontSize: '13px' },
    requiredMark: {
      color: 'rgb(164, 38, 44)',
      paddingRight: '12px',
    },
  });
