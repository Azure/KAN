import Url from './Url';
import { theme } from './theme';

export const ERROR_BLANK_VALUE = 'Value cannot be blank.';
export const ERROR_NAME_BLANK = 'Name cannot be blank.';
export const ERROR_NAME_BE_USED = 'Name is already used.';

export { Url, theme };

export type TrainStatus =
  | 'Finding project'
  | 'Uploading project'
  | 'Uploading project'
  | 'Uploading parts'
  | 'Uploading images'
  | 'Preparing training task'
  | 'Preparing custom vision environment'
  | 'Training'
  | 'Exporting'
  | 'Success'
  | 'Failed'
  | 'No change'
  | 'ok'
  | 'Deploying';

export const DEMO_SCENARIO_IDS = [3, 4, 5, 6, 7, 8];
