import { createReducer, on } from '@ngrx/store';
import AuthConst from 'src/app/const/auth';
import { AuthActions } from 'src/app/store/auth/auth.actions';
import { UserData } from 'src/app/store/auth/auth.model';

export const AUTH_FEATURE_KEY = 'auth';

export interface AuthState {
  accessToken: string | undefined;
  loggedInUser: UserData | undefined;
}

export const authInitialState: AuthState = {
  accessToken: localStorage.getItem(AuthConst.STORAGE_KEY) ?? undefined,
  loggedInUser: undefined
};

export const authReducer = createReducer(
  authInitialState,

  on(AuthActions.setAccessToken, (state, { accessToken }): AuthState => ({ ...state, accessToken })),
  on(AuthActions.setLoggedInUser, (state, { loggedInUser }): AuthState => ({ ...state, loggedInUser })),

  on(AuthActions.logInSuccess, (state, { accessToken }): AuthState => ({ ...state, accessToken })),

  on(AuthActions.fetchUserSuccess, (state, { loggedInUser }): AuthState => ({ ...state, loggedInUser })),

  on(AuthActions.logOutSuccess, (state): AuthState => ({ ...state, accessToken: undefined })),

  on(AuthActions.reset, (): AuthState => ({ ...authInitialState }))
);
