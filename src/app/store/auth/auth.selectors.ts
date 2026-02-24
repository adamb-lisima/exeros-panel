import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AUTH_FEATURE_KEY, AuthState } from './auth.reducer';

const getState = createFeatureSelector<AuthState>(AUTH_FEATURE_KEY);

export const AuthSelectors = {
  accessToken: createSelector(getState, state => state.accessToken),

  loggedInUser: createSelector(getState, state => state.loggedInUser),

  isSuperAdminOrAdmin: createSelector(getState, state => state.loggedInUser?.role === 'SUPER_ADMIN' || state.loggedInUser?.role === 'ADMIN'),

  isSuperAdmin: createSelector(getState, state => state.loggedInUser?.role === 'SUPER_ADMIN')
};
