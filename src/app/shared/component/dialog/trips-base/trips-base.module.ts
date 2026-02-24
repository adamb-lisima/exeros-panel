import { AsyncPipe, CommonModule, NgForOf, NgIf } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgForTrackByFieldModule } from '../../../directive/ng-for-track-by-field/ng-for-track-by-field.module';
import { DateFormatModule } from '../../../pipe/date-format/date-format.module';
import { IncludesModule } from '../../../pipe/includes/includes.module';
import { SelectControlModule } from '../../control/select-control/select-control.module';
import { InfinityScrollModule } from '../../infinity-scroll/infinity-scroll.module';
import { MapModule } from '../../map/map.module';
import { SkeletonLoaderModule } from '../../skeleton-loader/skeleton-loader.module';
import { TripsBaseComponent } from './trips-base.component';

@NgModule({
  exports: [TripsBaseComponent],
  imports: [AsyncPipe, DateFormatModule, IncludesModule, MapModule, NgForOf, NgForTrackByFieldModule, NgIf, CommonModule, MapModule, ReactiveFormsModule, SelectControlModule, InfinityScrollModule, SkeletonLoaderModule],
  declarations: [TripsBaseComponent]
})
export class TripsBaseModule {}
