import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app-store.model';
import { DriversActions } from '../../../drivers.actions';
import { AlarmsParams } from '../../../drivers.model';
import { DriversSelectors } from '../../../drivers.selectors';

@Component({
  selector: 'app-drivers-core-tabs-alarms',
  templateUrl: './drivers-core-tabs-alarms.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriversCoreTabsAlarmsComponent {
  webSocketAlarms$ = this.store.select(state => state.webSocket.alarms);
  driver$ = this.store.select(DriversSelectors.driver);
  alarms$ = this.store.select(DriversSelectors.alarms);
  alarmsMeta$ = this.store.select(DriversSelectors.alarmsMeta);
  alarmsLoading$ = this.store.select(DriversSelectors.alarmsLoading);

  constructor(private readonly store: Store<AppState>) {}

  handleNextPageRequest(page: AlarmsParams['page']): void {
    this.store.dispatch(DriversActions.fetchAlarms({ params: { page } }));
  }
}
