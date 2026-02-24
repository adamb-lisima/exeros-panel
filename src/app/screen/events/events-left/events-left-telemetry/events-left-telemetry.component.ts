import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../store/app-store.model';
import { EventsSelectors } from '../../events.selectors';

@Component({
  selector: 'app-events-left-telemetry',
  templateUrl: './events-left-telemetry.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsLeftTelemetryComponent {
  telemetry$ = this.store.select(EventsSelectors.telemetry);

  constructor(private readonly store: Store<AppState>, private readonly router: Router) {}
}
