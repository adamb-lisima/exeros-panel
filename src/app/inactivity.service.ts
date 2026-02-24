import { Dialog } from '@angular/cdk/dialog';
import { Injectable, NgZone } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { filter, Subscription, tap } from 'rxjs';
import AuthConst from './const/auth';
import RouteConst from './const/route';
import { RouteQueryParams } from './model/route.models';
import { SettingsActions } from './screen/settings/settings.actions';
import { MfaParams } from './screen/settings/settings.model';
import { ConfirmationDialogData, ConfirmationDialogReturn } from './shared/component/dialog/confirmation-dialog/confirmation-dialog.model';
import { MfaInactivityDialogComponent } from './shared/component/dialog/mfa-inactivity-dialog/mfa-inactivity-dialog.component';
import { AuthSelectors } from './store/auth/auth.selectors';
import RoutingUtil from './util/routing.util';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private timeoutId: any;
  private readonly inactivityTime = 5 * 60 * 1000; // 5 minutes
  private windowOpen = false;
  private isMfaEnabled: boolean | undefined = false;
  private readonly tabId = `tab_${new Date().getTime()}_${Math.random()}`;
  loggedInUser$ = this.store.select(AuthSelectors.loggedInUser);
  private subscription?: Subscription;

  constructor(private readonly ngZone: NgZone, private readonly router: Router, private readonly actions$: Actions, private readonly dialog: Dialog, private readonly store: Store) {
    this.subscribeRouteChange();
    this.startTimer();
    this.setupListeners();
    this.loggedInUser$.subscribe(_ => {
      const sessionLoaded = sessionStorage.getItem('sessionLoaded');
      if (this.noOtherTabsOpen() && !sessionLoaded) {
        this.checkAndOpenDialog();
      } else {
        localStorage.setItem(this.tabId, 'active');
        sessionStorage.setItem('sessionLoaded', 'true');
      }

      window.addEventListener('beforeunload', () => {
        sessionStorage.removeItem('sessionLoaded');
        localStorage.removeItem(this.tabId);
      });
    });
  }

  private noOtherTabsOpen(): boolean {
    return Object.keys(localStorage).filter(key => key.startsWith('tab_')).length === 0;
  }

  private subscribeRouteChange(): void {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      if (localStorage.getItem(AuthConst.INACTIVITY_STATUS) === '1') {
        this.windowOpen = false;
        this.checkAndOpenDialog();
      }
    });
  }
  private checkAndOpenDialog(): void {
    let is_screenshot = false;
    this.loggedInUser$.subscribe(user => {
      this.isMfaEnabled = user?.is_mfa_enabled;
    });
    if (!this.isMfaEnabled) {
      return;
    }
    this.subscription = new Subscription();
    this.subscription.add(
      RoutingUtil.mergeQueryParams<RouteQueryParams>(this.router)
        .pipe(
          filter(() => {
            const expectedUrl = `${location.origin}/#/${RouteConst.events}/`;
            return location.href.startsWith(expectedUrl);
          }),
          tap(params => {
            if (params.mode === 'screenshot') {
              sessionStorage.setItem('sessionLoaded', 'true');
              is_screenshot = true;
            }
            if (!this.windowOpen && !is_screenshot) {
              this.store.dispatch(SettingsActions.sendMfa({ body: { type: 'LOCK' } as MfaParams }));
              localStorage.setItem(AuthConst.INACTIVITY_STATUS, '1');
              this.windowOpen = true;
              this.dialog
                .open<ConfirmationDialogReturn, ConfirmationDialogData>(MfaInactivityDialogComponent, {
                  data: {
                    header: 'Inactivity MFA',
                    content: 'We suspended your session due to inactivity, enter code from email or login again.'
                  },
                  hasBackdrop: true,
                  backdropClass: 'custom-backdrop',
                  disableClose: true
                })
                .closed.pipe(
                  tap(data => {
                    if (data?.confirmed) {
                      localStorage.setItem(this.tabId, 'active');
                      sessionStorage.setItem('sessionLoaded', 'true');
                      this.windowOpen = false;
                    }
                  })
                )
                .subscribe();
            }
          })
        )
        .subscribe()
    );

    this.subscription.unsubscribe();
  }

  private setupListeners() {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];

    events.forEach(event => {
      window.addEventListener(event, () => this.resetTimer());
    });
  }

  private startTimer() {
    this.updateLastActivity();
    this.timeoutId = this.ngZone.runOutsideAngular(() => setTimeout(() => this.executeInactivity(), this.inactivityTime));
  }

  private resetTimer() {
    clearTimeout(this.timeoutId);
    this.startTimer();
  }

  private executeInactivity() {
    this.ngZone.run(() => {
      if (!this.isActive()) {
        this.startTimer();
      }
    });
  }

  private updateLastActivity() {
    const currentTime = new Date().getTime();
    localStorage.setItem(AuthConst.LAST_ACTIVITY, currentTime.toString());
  }

  private isActive(): boolean {
    let lastActivity = this.getLastActivity();
    if (lastActivity) {
      const currentTime = new Date().getTime();
      const differenceInMilliseconds = currentTime - lastActivity;
      return differenceInMilliseconds < this.inactivityTime;
    }
    return false;
  }

  private getLastActivity(): number | null {
    const lastActivity = localStorage.getItem(AuthConst.LAST_ACTIVITY);
    return lastActivity ? parseInt(lastActivity, 10) : null;
  }
}
