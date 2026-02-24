import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CONFIG_FEATURE_KEY, ConfigState } from './config.reducer';

const getState = createFeatureSelector<ConfigState>(CONFIG_FEATURE_KEY);

export const ConfigSelectors = {
  data: createSelector(getState, state => state.data)
};
