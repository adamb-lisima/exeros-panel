import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ALERT_FEATURE_KEY, AlertState } from 'src/app/store/alert/alert.reducer';

const getAlertState = createFeatureSelector<AlertState>(ALERT_FEATURE_KEY);

export const AlertSelectors = {
  alert: createSelector(getAlertState, state => state.alert)
};
