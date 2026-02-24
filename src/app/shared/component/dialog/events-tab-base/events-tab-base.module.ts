import { AsyncPipe, CommonModule, NgForOf, NgIf } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgForTrackByFieldModule } from '../../../directive/ng-for-track-by-field/ng-for-track-by-field.module';
import { DateFormatModule } from '../../../pipe/date-format/date-format.module';
import { IncludesModule } from '../../../pipe/includes/includes.module';
import { EventIconModule } from '../../event-icon/event-icon.module';
import { InfinityScrollModule } from '../../infinity-scroll/infinity-scroll.module';
import { MapModule } from '../../map/map.module';
import { EventsTabBaseComponent } from './events-tab-base.component';

@NgModule({
  exports: [EventsTabBaseComponent],
  imports: [AsyncPipe, DateFormatModule, IncludesModule, MapModule, NgForOf, NgForTrackByFieldModule, NgIf, CommonModule, InfinityScrollModule, EventIconModule],
  declarations: [EventsTabBaseComponent]
})
export class EventsTabBaseModule {}
