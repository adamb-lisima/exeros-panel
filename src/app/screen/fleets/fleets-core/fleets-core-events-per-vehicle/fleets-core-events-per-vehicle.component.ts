import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { FleetsSelectors } from '../../fleets.selectors';

type SortDirection = 'asc' | 'desc' | null;
type SortColumn = 'registration_plate' | 'event_count' | null;

interface SortState {
  column: SortColumn;
  direction: SortDirection;
}

@Component({
  selector: 'app-fleets-core-events-per-vehicle',
  templateUrl: './fleets-core-events-per-vehicle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FleetsCoreEventsPerVehicleComponent {
  private readonly sortState = new BehaviorSubject<SortState>({ column: null, direction: null });
  private readonly eventsPerVehicleRaw$ = this.store.select(FleetsSelectors.eventsStatsElement);

  eventsPerVehicle$ = combineLatest([this.eventsPerVehicleRaw$, this.sortState]).pipe(
    map(([data, sort]) => {
      if (!data?.event_per_vehicles?.length || !sort.column || !sort.direction) {
        return data;
      }

      return {
        ...data,
        event_per_vehicles: [...data.event_per_vehicles].sort((a, b) => {
          const multiplier = sort.direction === 'asc' ? 1 : -1;

          if (sort.column === 'registration_plate') {
            return multiplier * a.registration_plate.localeCompare(b.registration_plate);
          }

          return multiplier * (a.event_count - b.event_count);
        })
      };
    })
  );

  constructor(private readonly store: Store) {}

  sort(column: SortColumn): void {
    const currentState = this.sortState.value;
    let newDirection: SortDirection = 'asc';

    if (currentState.column === column) {
      if (currentState.direction === 'asc') newDirection = 'desc';
      else if (currentState.direction === 'desc') {
        column = null;
        newDirection = null;
      }
    }

    this.sortState.next({ column, direction: newDirection });
  }

  getSortIcon(column: SortColumn): string {
    const state = this.sortState.value;
    if (state.column !== column) return '↕';
    return state.direction === 'asc' ? '↑' : '↓';
  }
}
