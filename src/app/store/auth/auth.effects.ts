import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concat, concatMap, debounceTime, EMPTY, map, of, switchMap, tap } from 'rxjs';
import AuthConst from 'src/app/const/auth';
import RouteConst from 'src/app/const/route';
import { applicationLoading, applicationReset } from 'src/app/store/application/application.actions';
import { AuthActions } from 'src/app/store/auth/auth.actions';
import { AuthService } from 'src/app/store/auth/auth.service';
import { AlertActions } from '../alert/alert.actions';
import { LoginData } from './auth.model';

interface ApiError {
  message?: string;
  errors?: string[] | string;
  [key: string]: unknown;
}

@Injectable()
export class AuthEffects {
  logIn$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logIn),
      switchMap(({ body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'logIn$' })),
          this.authService.logIn(body).pipe(
            tap(({ data }) => {
              if (isLoginData(data)) {
                localStorage.setItem(AuthConst.STORAGE_KEY, data.access_token);
                const currentTime = new Date().getTime();
                localStorage.setItem(AuthConst.LAST_ACTIVITY, currentTime.toString());
                localStorage.setItem(AuthConst.INACTIVITY_STATUS, data.inactivity_status);
                this.router.navigate(['/']);
              }
            }),
            map(({ data }) => {
              if (isLoginData(data)) {
                sessionStorage.setItem('sessionLoaded', 'true');
                return AuthActions.logInSuccess({ accessToken: data.access_token });
              } else {
                return AuthActions.logInCode();
              }
            }),
            catchError((error: unknown) => {
              const apiError = error as ApiError;
              const { message, errors } = apiError;
              return of(
                AlertActions.display({
                  alert: {
                    type: 'error',
                    message: message ?? (Array.isArray(errors) ? errors.join(',') : 'Invalid email or password')
                  }
                })
              );
            })
          ),
          of(applicationLoading({ loading: false, key: 'logIn$' }))
        )
      )
    )
  );

  resetPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.resetPassword),
      switchMap(({ body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'resetPassword$' })),
          this.authService.resetPassword(body).pipe(
            tap(() => this.router.navigate(['/', RouteConst.login])),
            concatMap(() => [AuthActions.resetPasswordSuccess(), AlertActions.display({ alert: { type: 'success', message: 'Password successfully reset!\nCheck your email for more details.' } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'resetPassword$' }))
        )
      )
    )
  );

  changePassword = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.changePassword),
      switchMap(({ body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'changePassword$' })),
          this.authService.changePassword(body).pipe(
            tap(() => this.router.navigate(['/', RouteConst.login])),
            concatMap(() => [AuthActions.changePasswordSuccess(), AlertActions.display({ alert: { type: 'success', message: 'Password successfully changed!' } })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'changePassword$' }))
        )
      )
    )
  );

  fetchUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.fetchUser),
      switchMap(() =>
        this.authService.fetchUser().pipe(
          map(({ data }) => AuthActions.fetchUserSuccess({ loggedInUser: data })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  logOut$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logOut),
      debounceTime(100),
      switchMap(() =>
        concat(
          of(applicationLoading({ loading: true, key: 'logOut$' })),
          this.authService.logOut().pipe(
            catchError(() => of({})),
            tap(() => localStorage.removeItem(AuthConst.STORAGE_KEY)),
            tap(() => this.router.navigate(['/', RouteConst.login])),
            concatMap(() => [AuthActions.reset(), AuthActions.logOutSuccess(), AlertActions.display({ alert: { type: 'success', message: 'Successfully logged out!' } })])
          ),
          of(applicationReset())
        )
      )
    )
  );

  constructor(private readonly actions$: Actions, private readonly authService: AuthService, private readonly router: Router) {}
}

function isLoginData(data: any): data is LoginData {
  return (data as LoginData).access_token !== undefined;
}
