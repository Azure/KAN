import { mergeStyleSets } from '@fluentui/react';

import { theme } from '../../../constant';

export const getCascadeFlowClasses = () =>
  mergeStyleSets({
    flow: {
      '.react-flow__handle': {
        height: '11px',
        width: '11px',
      },
      '.react-flow__handle-top': {
        top: '-7px',
      },
      '.react-flow__handle-bottom': {
        bottom: '-7px',
      },
      '.react-flow__handle-connecting': {
        background: theme.palette.red,
        ':hover': {
          height: '15px',
          width: '15px',
          bottom: '-9px',
        },
      },
      '.react-flow__handle-valid': {
        background: theme.palette.greenLight,
        ':hover': {
          height: '15px',
          width: '15px',
          bottom: '-9px',
        },
      },
      '.edgebutton-foreignobject body': {
        alignItems: 'center',
        background: 'transparent',
        display: 'flex',
        height: '40px',
        justifyContent: 'center',
        minHeight: '40px',
        width: '40px',
      },
      '.edgebutton': {
        color: '#555',
        background: '#FFF',
        border: '1px solid #EEE',
        borderRadius: '50%',
        cursor: 'pointer',
        fontSize: '12px',
        height: '20px',
        lineHeight: '1',
        width: '20px',
        ':hover': {
          boxShadow: '0 0 6px 2px rgb(0 0 0 / 8%)',
          transform: 'scale(1.1)',
        },
      },
    },
    errorWrapper: {
      position: 'absolute',
      left: '280px',
      zIndex: 10,
      width: 'calc(100% - 300px)',
      padding: '10px',
    },
  });

export const getNavCardClasses = () =>
  mergeStyleSets({
    root: {
      boxShadow: '0px 0.3px 0.9px rgba(0, 0, 0, 0.1), 0px 1.6px 3.6px rgba(0, 0, 0, 0.13)',
      position: 'relative',
    },
    titleWrapper: {
      padding: '5px 10px',
      borderBottom: '1px solid #edebe9',
      width: '100%',
    },
    title: {
      fontSize: '14px',
      lineHeight: '20px',
    },
    label: {
      fontSize: '12px',
      lineHeight: '16px',
    },
    controlBtn: {
      padding: '10px',
      justifyContent: 'center',
      '& i': {
        fontSize: '24px',
      },
      ':hover': {
        cursor: 'pointer',
      },
    },
    bottomWrapper: {
      padding: '12px',
    },
    smallLabel: {
      fontSize: '10px',
      lineHeight: '14px',
    },
    addLabel: {
      fontSize: '13px',
      lineHeight: '18px',
    },
    disableCover: {
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
      cursor: 'not-allowed',
      position: 'absolute',
      width: '100%',
      height: '100%',
      zIndex: 2,
    },
  });
