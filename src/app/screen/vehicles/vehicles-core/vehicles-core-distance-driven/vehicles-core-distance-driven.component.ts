import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { VehiclesSelectors } from '../../vehicles.selectors';

@Component({
  selector: 'app-vehicles-core-distance-driven',
  templateUrl: './vehicles-core-distance-driven.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesCoreDistanceDrivenComponent {
  vehicle$ = this.store.select(VehiclesSelectors.vehicle);

  constructor(private readonly store: Store) {}
}
