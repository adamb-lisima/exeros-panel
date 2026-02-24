import { createReducer, on } from '@ngrx/store';
import { ConfigActions } from 'src/app/store/config/config.actions';
import { ConfigData } from 'src/app/store/config/config.model';

export const CONFIG_FEATURE_KEY = 'config';

export interface ConfigState {
  data: ConfigData | undefined;
}

export const configInitialState: ConfigState = {
  data: undefined
};

export const configReducer = createReducer(
  configInitialState,

  on(ConfigActions.fetchAllDataSuccess, (state, props): ConfigState => ({ ...state, data: props.data })),

  on(ConfigActions.reset, (): ConfigState => ({ ...configInitialState }))
);
