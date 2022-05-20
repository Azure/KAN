import { ICommandBarItemProps } from '@fluentui/react';

import { OpenVinoType } from '../store/IntelProjectSlice';

export const convertProjectType = (type: OpenVinoType) => {
  if (type === 'ObjectDetection') return 'Object Detection';
  return 'Classification';
};

export const commonCommandBarItems: ICommandBarItemProps[] = [
  {
    key: 'feedback',
    text: 'Feedback',
    iconProps: {
      iconName: 'Emoji2',
    },
    onClick: () => {
      const win = window.open('https://go.microsoft.com/fwlink/?linkid=2173531', '_blank');
      win.focus();
    },
  },
  {
    key: 'learnMore',
    text: 'Learn more',
    iconProps: {
      iconName: 'NavigateExternalInline',
    },
    onClick: () => {
      const win = window.open(
        'https://github.com/Azure-Samples/azure-intelligent-edge-patterns/tree/master/factory-ai-vision',
        '_blank',
      );
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
      const win = window.open(
        'https://github.com/Azure-Samples/azure-intelligent-edge-patterns/issues',
        '_blank',
      );
      win.focus();
    },
  },
];

export function getStepKey<T>(currentStep: T, stepList: T[], step: number): T {
  if (stepList[0] === currentStep && step === -1) return currentStep;
  if (stepList[stepList.length - 1] === currentStep && step === 1) return currentStep;

  const currentIdx = stepList.findIndex((step) => step === currentStep);

  return stepList[currentIdx + step];
}
