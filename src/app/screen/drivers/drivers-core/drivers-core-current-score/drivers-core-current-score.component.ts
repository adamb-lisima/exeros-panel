import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DriversSelectors } from '../../drivers.selectors';

@Component({
  selector: 'app-drivers-core-current-score',
  templateUrl: './drivers-core-current-score.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriversCoreCurrentScoreComponent {
  current_star_rating$: Observable<number> = this.store.select(DriversSelectors.safetyScoresMeta).pipe(map(meta => meta?.current_star_rating ?? 0));

  constructor(private readonly store: Store) {}
}
