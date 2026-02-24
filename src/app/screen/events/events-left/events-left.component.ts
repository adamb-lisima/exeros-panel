import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store/app-store.model';
import { EventsSelectors } from '../events.selectors';

@Component({
  templateUrl: './events-left.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsLeftComponent {
  selectedVehicleId: number | undefined;
  isFiltersVisible = true;

  eventsMeta$ = this.store.select(EventsSelectors.eventsMeta);

  onVehicleIdChange(newVehicleId: number) {
    this.selectedVehicleId = newVehicleId;
  }

  toggleFilters() {
    this.isFiltersVisible = !this.isFiltersVisible;
  }

  constructor(private readonly store: Store<AppState>) {}
}
