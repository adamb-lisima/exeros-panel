import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError, Observable, take, throwError } from 'rxjs';
import { AlertActions } from 'src/app/store/alert/alert.actions';
import { environment } from 'src/environments/environment';
import RouteConst from '../../../const/route';
import { AuthActions } from '../../../store/auth/auth.actions';
import { AuthSelectors } from '../../../store/auth/auth.selectors';
import { ErrorLoggerService } from '../../../store/error-logger.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private readonly store: Store, private readonly router: Router, private readonly injector: Injector) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const logger = this.injector.get(ErrorLoggerService);

    return next.handle(request).pipe(
      catchError((response: HttpErrorResponse) => {
        if (!response.url?.includes(environment.baseUrl)) {
          return throwError(() => response);
        }

        if (response.status === 401 && !request.url.includes('logout') && !request.url.includes('login')) {
          if (response.error.message === 'Unauthenticated.') {
            this.store.dispatch(AuthActions.logOut());
          } else {
            let currentUser: any = null;
            this.store
              .select(AuthSelectors.loggedInUser)
              .pipe(take(1))
              .subscribe(user => {
                currentUser = user;
              });

            this.store.dispatch(
              AlertActions.display({
                alert: {
                  message: response.error.message ?? 'Oops, something went wrong',
                  list: ['You have been redirected to dashboard.'],
                  type: 'error'
                }
              })
            );

            const userEmail = currentUser?.email ?? 'unknown';
            logger.logError('Check this users role and fix access rights!!! url: ' + request.url + ', status: ' + response.status + ', User: ' + userEmail, '', '', '');

            this.router.navigate(['/', RouteConst.dashboard]);
          }
        }

        this.store.dispatch(
          AlertActions.display({
            alert: {
              message: response.error.message ?? 'Oops, something went wrong',
              list: Array.isArray(response.error.errors) ? response.error.errors : Object.values<string[]>(response.error.errors).reduce((prev, curr) => [...prev, ...curr], []),
              type: 'error'
            }
          })
        );

        return throwError(() => response.error);
      })
    );
  }
}
