import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IFRAME_FEATURE_KEY, IframeState } from './iframe.reducer';

const getState = createFeatureSelector<IframeState>(IFRAME_FEATURE_KEY);

export const IframeSelectors = {
  iframeState: createSelector(getState, state => state)
};
