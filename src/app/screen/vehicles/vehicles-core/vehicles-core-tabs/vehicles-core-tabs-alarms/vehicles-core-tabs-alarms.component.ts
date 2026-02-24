import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app-store.model';
import { VehiclesActions } from '../../../vehicles.actions';
import { AlarmsParams } from '../../../vehicles.model';
import { VehiclesSelectors } from '../../../vehicles.selectors';

@Component({
  selector: 'app-vehicles-core-tabs-alarms',
  templateUrl: './vehicles-core-tabs-alarms.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesCoreTabsAlarmsComponent {
  webSocketAlarms$ = this.store.select(state => state.webSocket.alarms);
  vehicle$ = this.store.select(VehiclesSelectors.vehicle);
  alarms$ = this.store.select(VehiclesSelectors.alarms);
  alarmsMeta$ = this.store.select(VehiclesSelectors.alarmsMeta);
  alarmsLoading$ = this.store.select(VehiclesSelectors.alarmsLoading);

  constructor(private readonly store: Store<AppState>) {}

  handleNextPageRequest(page: AlarmsParams['page']): void {
    this.store.dispatch(VehiclesActions.fetchAlarms({ params: { page } }));
  }
}
