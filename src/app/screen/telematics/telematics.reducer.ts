import { createReducer, on } from '@ngrx/store';
import { TelematicsActions } from './telematics.actions';

export const TELEMATICS_FEATURE_KEY = 'telematics';

export interface TelematicsState {}

export const telematicsInitialState: TelematicsState = {};

export const telematicsReducer = createReducer(
  telematicsInitialState,

  on(TelematicsActions.reset, (): TelematicsState => ({ ...telematicsInitialState }))
);
