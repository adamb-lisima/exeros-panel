import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { TelemetryTimelinePoint } from '../../../screen/stream/stream.model';
import { ExtendedTelemetryMetricsData } from '../telemetry-metrics/telemetry-metrics.component';
export interface PlaybackScope {
  telemetry_signal?: number;
}

@Component({
  selector: 'app-telemetry-header',
  templateUrl: './telemetry-header.component.html'
})
export class TelemetryHeaderComponent {
  @Input() liveData$!: Observable<ExtendedTelemetryMetricsData | null> | null;
  @Input() telemetryData$: Observable<TelemetryTimelinePoint | null> | undefined;
  @Input() playbackScope$?: Observable<PlaybackScope | undefined>;
  @Input() showExport = false;
  @Input() hasTelematics = false;

  @Output() driverClick = new EventEmitter<string>();
  @Output() exportClick = new EventEmitter<void>();

  handleDriverClick(driverId?: string | number): void {
    if (driverId) {
      this.driverClick.emit(driverId as string);
    }
  }

  handleExportClick(): void {
    this.exportClick.emit();
  }

  mapVehicleType(vehicleType: string): string {
    const vehicleTypeMap: { [key: string]: string } = {
      car: 'Car',
      truck: 'Truck',
      motorcycle: 'Motorcycle',
      bus: 'Bus',
      van: 'Van'
    };
    return vehicleTypeMap[vehicleType] || vehicleType;
  }

  getSignalColor(signal?: number): string {
    if (!signal) return '#D1D5DB';
    if (signal <= 2) return '#EF4444';
    if (signal <= 3) return '#F59E0B';
    return '#10B981';
  }
}
