import { ICommandBarItemProps } from '@fluentui/react';

import { FEEDBACK_URL, TROUBLE_SHOOTING_URL } from './constant';

export const convertProjectType = (type: any) => {
  if (type === 'ObjectDetection') return 'Object Detection';
  if (type == 'GPT4') return 'GPT-4';
  return 'Classification';
};

export const getLimitText = (value: string, limit: number) => {
  if (value.length > limit) return `${value.slice(0, limit)}...`;
  return value;
};

export const commonCommandBarItems: ICommandBarItemProps[] = [
  {
    key: 'feedback',
    text: 'Feedback',
    iconProps: {
      iconName: 'Feedback',
    },
    onClick: () => {
      const win = window.open(FEEDBACK_URL, '_blank');
      win.focus();
    },
  },
  {
    key: 'help',
    text: 'Troubleshooting',
    iconProps: {
      iconName: 'Help',
    },
    onClick: () => {
      const win = window.open(TROUBLE_SHOOTING_URL, '_blank');
      win.focus();
    },
  },
];

export function getStepKey<T>(currentStep: T, stepList: T[], setpNumber: number): T {
  if (stepList[0] === currentStep && setpNumber === -1) return currentStep;
  if (stepList[stepList.length - 1] === currentStep && setpNumber === 1) return currentStep;

  const currentIdx = stepList.findIndex((step) => step === currentStep);

  return stepList[currentIdx + setpNumber];
}
