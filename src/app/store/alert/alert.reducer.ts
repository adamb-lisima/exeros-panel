import { createReducer, on } from '@ngrx/store';
import { Alert } from 'src/app/store/alert/alert.model';
import { AlertActions } from './alert.actions';

export const ALERT_FEATURE_KEY = 'alert';

export interface AlertState {
  alert: Alert | undefined;
}

export const alertInitialState: AlertState = {
  alert: undefined
};

export const alertReducer = createReducer(
  alertInitialState,
  on(AlertActions.display, (state, props): AlertState => ({ ...state, alert: props.alert })),
  on(AlertActions.hide, (state): AlertState => ({ ...state, alert: undefined })),
  on(AlertActions.reset, (): AlertState => ({ ...alertInitialState }))
);
