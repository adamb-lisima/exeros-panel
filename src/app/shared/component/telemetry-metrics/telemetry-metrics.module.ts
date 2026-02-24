import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from '../../directive/tooltip/tooltip.module';
import { UnitConverterModule } from '../../pipe/unit-converter/unit-converter.module';
import { TelemetryMetricsComponent } from './telemetry-metrics.component';

@NgModule({
  declarations: [TelemetryMetricsComponent],
  imports: [CommonModule, UnitConverterModule, TooltipModule],
  exports: [TelemetryMetricsComponent]
})
export class TelemetryMetricsModule {}
