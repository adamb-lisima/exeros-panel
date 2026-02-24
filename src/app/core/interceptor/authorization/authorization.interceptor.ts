import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { first, Observable, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthSelectors } from '../../../store/auth/auth.selectors';

@Injectable()
export class AuthorizationInterceptor implements HttpInterceptor {
  private readonly accessToken$ = this.store.select(AuthSelectors.accessToken);

  constructor(private readonly store: Store) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.accessToken$.pipe(
      first(),
      switchMap(accessToken => next.handle(accessToken && request.url.includes(environment.baseUrl) ? request.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } }) : request))
    );
  }
}
