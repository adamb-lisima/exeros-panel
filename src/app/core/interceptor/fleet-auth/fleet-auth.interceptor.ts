import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthActions } from '../../../store/auth/auth.actions';
import { CommonObjectsActions } from '../../../store/common-objects/common-objects.actions';

@Injectable()
export class FleetAuthInterceptor implements HttpInterceptor {
  private readonly FLEET_ID_KEY = 'exeros-fleet-id';

  constructor(private readonly store: Store) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (this.isFleetAccessError(error)) {
          this.handleFleetAccessError();
        }
        return throwError(() => error);
      })
    );
  }

  private isFleetAccessError(error: HttpErrorResponse): boolean {
    if (error.status === 422) {
      const errorMessage = error.error?.message ?? '';
      return errorMessage.includes('Fleet with provided id does not exist or you do not have an access');
    }

    return false;
  }

  private handleFleetAccessError(): void {
    localStorage.removeItem(this.FLEET_ID_KEY);
    localStorage.setItem(this.FLEET_ID_KEY, '1');

    this.store.dispatch(AuthActions.fetchUser());
    this.store.dispatch(CommonObjectsActions.fetchFleetsTree());

    window.location.reload();
  }
}
