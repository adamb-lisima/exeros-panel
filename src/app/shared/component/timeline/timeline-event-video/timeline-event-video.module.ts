import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { EventsModule } from '../../../../screen/events/events.module';
import { HasPermissionModule } from '../../../directive/has-permission/has-permission.module';
import { TooltipModule } from '../../../directive/tooltip/tooltip.module';
import { DateFormatModule } from '../../../pipe/date-format/date-format.module';
import { UnitConverterModule } from '../../../pipe/unit-converter/unit-converter.module';
import { EventIconModule } from '../../event-icon/event-icon.module';
import { TimelineEventVideoComponent } from './timeline-event-video.component';

@NgModule({
  declarations: [TimelineEventVideoComponent],
  imports: [CommonModule, EventIconModule, DateFormatModule, UnitConverterModule, TooltipModule, HasPermissionModule, GoogleMapsModule, EventsModule],
  exports: [TimelineEventVideoComponent]
})
export class TimelineEventVideoModule {}
