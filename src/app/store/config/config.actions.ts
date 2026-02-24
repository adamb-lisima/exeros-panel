import { createAction, props } from '@ngrx/store';
import { ConfigData } from 'src/app/store/config/config.model';

export const ConfigActions = {
  fetchAllData: createAction('[Config] FetchAllData'),
  fetchAllDataSuccess: createAction('[Config] FetchAllData Success', props<{ data: ConfigData }>()),
  reset: createAction('[Config] Reset')
};
