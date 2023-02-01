import { MetadataType } from '../../store/trainingProjectSlice';
import { ModelNodeType } from '../../store/types';

export type MetaData = {
  type: MetadataType;
  shape: number[];
} | null;

export type ValidationNode = {
  metadata: MetaData;
  nodeType: ModelNodeType;
};

export const LIMIT_OUTPUTS: MetadataType[] = ['classification', 'regression'];

export type CascadeError = '' | 'nodeDuplication' | 'nameDuplication' | 'discreteFlow' | 'atLeastOneExport';
