import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { startWith, filter, map } from 'rxjs';
import RouteConst from 'src/app/const/route';
import ROUTE_CONST from '../../../const/route';
import { AccessGroup } from '../../../screen/settings/settings.model';
import { ReportIssueModalComponent } from '../../../shared/component/report-issue-modal/report-issue-modal.component';
import { AuthActions } from '../../../store/auth/auth.actions';
import { AuthSelectors } from '../../../store/auth/auth.selectors';
import { ConfigSelectors } from '../../../store/config/config.selectors';
import { NavigationBarVersionDialogComponent } from './navigation-bar-version-dialog/navigation-bar-version-dialog.component';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationBarComponent {
  readonly ROUTE_CONST = RouteConst;
  configData$ = this.store.select(ConfigSelectors.data);
  loggedInUser$ = this.store.select(AuthSelectors.loggedInUser);
  accessGroup = AccessGroup;
  settingsAccess = [AccessGroup.SETTINGS_FLEET_MANAGEMENT, AccessGroup.SETTINGS_NOTIFICATION_SETTINGS, AccessGroup.SETTINGS_ROLE_MANAGEMENT, AccessGroup.SETTINGS_PROFILE, AccessGroup.SETTINGS_COMPANY_MANAGEMENTS, AccessGroup.SETTINGS_DRIVER_SCORE_WEIGHTS, AccessGroup.SETTINGS_DRIVER_MANAGEMENTS, AccessGroup.SETTINGS_AUTOMATED_REPORTS, AccessGroup.SETTINGS_INFOTAINMENT, AccessGroup.SETTINGS_VEHICLE_EVENT_STRATEGIES, AccessGroup.SETTINGS_SHARED_CLIPS_EMAILS];
  isMenuCollapsed = false;

  isStreamActive$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    startWith(null),
    map(() => {
      const url = this.router.url;
      return url.includes(ROUTE_CONST.stream) ?? url.includes(ROUTE_CONST.playbacks);
    }),
    startWith(false)
  );

  openVersionDialog(): void {
    this.dialog.open(NavigationBarVersionDialogComponent);
  }

  handleLogoutClick(): void {
    this.store.dispatch(AuthActions.logOut());
  }

  toggleMenu(): void {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  openReportIssueModal(): void {
    this.dialog.open<ReportIssueModalComponent>(ReportIssueModalComponent, {
      width: '500px',
      data: { vehicleId: undefined, isVehicleIssue: false }
    });
  }

  constructor(private readonly store: Store, private readonly dialog: Dialog, private readonly router: Router) {}
}
