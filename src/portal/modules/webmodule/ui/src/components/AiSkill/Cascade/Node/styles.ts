import { mergeStyleSets } from '@fluentui/react';

const NODE_MENU_BUTTOM_STYLES = {
  padding: '10px',
  marginRight: '12px',
  justifyContent: 'center',
  '& i': {
    fontSize: '16px',
  },
  ':hover': {
    cursor: 'pointer',
  },
};

export const getSourceNodeClasses = () =>
  mergeStyleSets({
    root: {
      width: '250px',
      border: '1px solid #C4C4C4',
      borderRadius: '2px',
      backgroundColor: '#FFF',
    },
    title: { fontSize: '24px' },
    describe: { fontSize: '14px', lineHeight: '20px' },
    controlBtn: NODE_MENU_BUTTOM_STYLES,
  });

export const getNodeClasses = () =>
  mergeStyleSets({
    node: {
      padding: 0,
      width: '300px',
      boxShadow: '0px 0.3px 0.9px rgba(0, 0, 0, 0.1), 0px 1.6px 3.6px rgba(0, 0, 0, 0.13)',
      border: 'none',
      backgroundColor: '#FFF',
    },
    nodeWrapper: { padding: '10px 12px', width: '220px' },
    title: { fontSize: '14px', lineHeight: '20px' },
    label: { fontSize: '12px', lineHeight: '20px', color: '#605E5C' },
    controlBtn: NODE_MENU_BUTTOM_STYLES,
  });

export const getExportNodeClasses = () =>
  mergeStyleSets({
    node: {
      padding: 0,
      width: '300px',
      boxShadow: '0px 0.3px 0.9px rgba(0, 0, 0, 0.1), 0px 1.6px 3.6px rgba(0, 0, 0, 0.13)',
      border: 'none',
      backgroundColor: '#FFF',
    },
    nodeWrapper: { padding: '10px 12px', width: '220px' },
    title: { fontSize: '14px', lineHeight: '20px' },
    label: { fontSize: '14px', lineHeight: '20px', color: '#605E5C' },
    controlBtn: NODE_MENU_BUTTOM_STYLES,
  });
