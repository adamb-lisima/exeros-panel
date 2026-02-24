import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { VehiclesSelectors } from '../../vehicles.selectors';

@Component({
  selector: 'app-vehicles-core-driving-time',
  templateUrl: './vehicles-core-driving-time.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesCoreDrivingTimeComponent {
  vehicle$ = this.store.select(VehiclesSelectors.vehicle);

  constructor(private readonly store: Store) {}
}
