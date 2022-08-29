import { IDropdownOption } from '@fluentui/react';

export const cardBorderStyle = {
  outline: '0.3px solid rgba(0,0,0,0.1)',
  borderRadius: '4px',
  boxShadow: '0px 0.3px 0.9px rgba(0, 0, 0, 0.1), 0px 1.6px 3.6px rgba(0, 0, 0, 0.13)',
  ':hover': {
    boxShadow: ' 0px 0.3px 0.9px rgba(0, 0, 0, 0.5), 0px 1.6px 3.6px rgba(0, 0, 0, 0.5)',
  },
};

const dGPU = 'Nvidia dGPU';
const CPU = 'CPU';
const NvidiaJetson = 'Nvidia Jetson (Jetpack 5)';
const iGPU = 'Intel iGPU';

export const customViisionModelAcceleration = [dGPU, CPU, NvidiaJetson, iGPU];
export const openVinoModelAcceleration = [CPU, iGPU];

const readonlyCustomViisionModelAcceleration = [dGPU, CPU, NvidiaJetson, iGPU] as const;
export type Acceleration = typeof readonlyCustomViisionModelAcceleration[number];

export const accelerationOptions: IDropdownOption[] = [
  { key: '-', text: '-' },
  { key: dGPU, text: dGPU },
  { key: CPU, text: CPU },
  { key: NvidiaJetson, text: NvidiaJetson },
  { key: iGPU, text: iGPU },
];

export const x64AccelerationOptions = accelerationOptions.filter((option) =>
  ['-', 'Nvidia dGPU', 'CPU', 'Intel iGPU'].includes(option.key as string),
);

export const arm64AccelerationOptions = accelerationOptions.filter((option) =>
  ['-', 'Nvidia Jetson (Jetpack 5)'].includes(option.key as string),
);
