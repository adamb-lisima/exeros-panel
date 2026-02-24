import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { DashboardSelectors } from 'src/app/screen/dashboard/dashboard.selectors';
import { AppState } from 'src/app/store/app-store.model';
import { AccessGroup } from '../../settings/settings.model';

@Component({
  templateUrl: './dashboard-core.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardCoreComponent {
  accessGroup = AccessGroup;
  dashboard$ = this.store.select(DashboardSelectors.dashboard);

  constructor(private readonly store: Store<AppState>) {}
}
