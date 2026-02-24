import { createAction, props } from '@ngrx/store';
import { ChangePasswordBody, LoginBody, ResetPasswordBody, UserData } from 'src/app/store/auth/auth.model';

export const AuthActions = {
  setAccessToken: createAction('[Auth] SetAccessToken', props<{ accessToken?: string }>()),
  setLoggedInUser: createAction('[Auth] SetLoggedInUser', props<{ loggedInUser: UserData }>()),

  logIn: createAction('[Auth] LogIn', props<{ body: LoginBody }>()),
  logInSuccess: createAction('[Auth] LogIn Success', props<{ accessToken: string }>()),
  logInCode: createAction('[Auth] LogIn Code'),

  resetPassword: createAction('[Auth] ResetPassword', props<{ body: ResetPasswordBody }>()),
  resetPasswordSuccess: createAction('[Auth] ResetPassword Success'),

  changePassword: createAction('[Auth] ChangePassword', props<{ body: ChangePasswordBody }>()),
  changePasswordSuccess: createAction('[Auth] ChangePassword Success'),

  fetchUser: createAction('[Auth] FetchUser'),
  fetchUserSuccess: createAction('[Auth] FetchUser Success', props<{ loggedInUser: UserData }>()),

  logOut: createAction('[Auth] LogOut'),
  logOutSuccess: createAction('[Auth] LogOut Success'),

  reset: createAction('[Auth] Reset')
};
