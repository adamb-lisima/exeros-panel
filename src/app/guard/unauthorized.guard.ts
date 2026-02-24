import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { first, map, Observable } from 'rxjs';
import { AuthSelectors } from '../store/auth/auth.selectors';

@Injectable({ providedIn: 'root' })
export class UnauthorizedGuard implements CanActivate {
  private readonly accessToken$ = this.store.select(AuthSelectors.accessToken);

  constructor(private readonly store: Store, private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.accessToken$.pipe(
      first(),
      map(accessToken => {
        if (!accessToken) {
          return true;
        }
        this.router.navigate(['/']);
        return false;
      })
    );
  }
}
