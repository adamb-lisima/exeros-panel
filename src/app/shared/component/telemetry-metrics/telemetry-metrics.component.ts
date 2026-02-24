import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Driver } from '../../../screen/drivers/drivers.model';
import { TelemetryTimelinePoint } from '../../../screen/stream/stream.model';
export interface ExtendedTelemetryMetricsData {
  driver?: Driver;
  telemetry_signal?: number;
}

@Component({
  selector: 'app-telemetry-metrics',
  templateUrl: './telemetry-metrics.component.html'
})
export class TelemetryMetricsComponent {
  @Input() telemetryData$: Observable<TelemetryTimelinePoint | null> | undefined;
  @Input() showAlerts = true;

  isDetailsExpanded = false;

  toggleDetails(): void {
    this.isDetailsExpanded = !this.isDetailsExpanded;
  }
}
