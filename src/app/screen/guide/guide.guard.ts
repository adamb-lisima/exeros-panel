import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { GuideActions } from './guide.actions';

@Injectable({
  providedIn: 'root'
})
export class GuideGuard implements CanActivate {
  constructor(private readonly store: Store) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this.store.dispatch(GuideActions.loadGuideMenu());

    return true;
  }

  canDeactivate(): boolean {
    return true;
  }
}
