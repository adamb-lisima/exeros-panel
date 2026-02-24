import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, map } from 'rxjs/operators';
import { DriversSelectors } from '../../drivers.selectors';

@Component({
  selector: 'app-drivers-core-vehicle-check',
  templateUrl: './drivers-core-vehicle-check.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriversCoreVehicleCheckComponent {
  vehicle_check_percentage$ = this.store.select(DriversSelectors.safetyScoresMeta).pipe(
    filter(meta => !!meta),
    map(meta => meta?.driver_vehicle_checks_percentage ?? 0)
  );

  constructor(private readonly store: Store) {}
}
