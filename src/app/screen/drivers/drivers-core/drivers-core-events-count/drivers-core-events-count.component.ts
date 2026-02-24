import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { DriversSelectors } from '../../drivers.selectors';

@Component({
  selector: 'app-drivers-core-events-count',
  templateUrl: './drivers-core-events-count.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriversCoreEventsCountComponent {
  driver$ = this.store.select(DriversSelectors.driver);

  constructor(private readonly store: Store) {}
}
