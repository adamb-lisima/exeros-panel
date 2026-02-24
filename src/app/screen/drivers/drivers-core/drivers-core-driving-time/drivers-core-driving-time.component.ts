import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { DriversSelectors } from '../../drivers.selectors';

@Component({
  selector: 'app-drivers-core-driving-time',
  templateUrl: './drivers-core-driving-time.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriversCoreDrivingTimeComponent {
  driver$ = this.store.select(DriversSelectors.driver);

  constructor(private readonly store: Store) {}
}
