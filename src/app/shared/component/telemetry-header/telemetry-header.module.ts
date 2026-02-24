import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from '../../directive/tooltip/tooltip.module';
import { StarRatingModule } from '../star-rating/star-rating.module';
import { TelemetryHeaderComponent } from './telemetry-header.component';

@NgModule({
  declarations: [TelemetryHeaderComponent],
  imports: [CommonModule, StarRatingModule, TooltipModule],
  exports: [TelemetryHeaderComponent]
})
export class TelemetryHeaderModule {}
