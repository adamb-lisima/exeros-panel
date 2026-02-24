import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { DriversSelectors } from '../../drivers.selectors';

@Component({
  selector: 'app-drivers-core-distance-driven',
  templateUrl: './drivers-core-distance-driven.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriversCoreDistanceDrivenComponent {
  driver$ = this.store.select(DriversSelectors.driver);

  constructor(private readonly store: Store) {}
}
