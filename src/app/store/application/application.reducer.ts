import { createReducer, on } from '@ngrx/store';
import { applicationLoading, applicationReset } from 'src/app/store/application/application.actions';

export const APPLICATION_FEATURE_KEY = 'application';

export interface ApplicationState {
  loadingNumber: number;
  loadingKeys: string[];
}

export const applicationInitialState: ApplicationState = {
  loadingNumber: 0,
  loadingKeys: []
};

export const applicationReducer = createReducer(
  applicationInitialState,
  on(applicationLoading, (state, props): ApplicationState => {
    const loadingKeys = props.loading ? Array.from(new Set([...state.loadingKeys, props.key])) : state.loadingKeys.filter(key => key !== props.key);
    return { ...state, loadingKeys, loadingNumber: loadingKeys.length };
  }),
  on(applicationReset, (): ApplicationState => ({ ...applicationInitialState }))
);
