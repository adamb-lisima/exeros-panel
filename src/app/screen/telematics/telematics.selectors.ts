import { createFeatureSelector } from '@ngrx/store';
import { TELEMATICS_FEATURE_KEY, TelematicsState } from './telematics.reducer';

const getState = createFeatureSelector<TelematicsState>(TELEMATICS_FEATURE_KEY);

export const TelematicsSelectors = {};
