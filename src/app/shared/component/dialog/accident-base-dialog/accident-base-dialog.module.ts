import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgForTrackByFieldModule } from '../../../directive/ng-for-track-by-field/ng-for-track-by-field.module';
import { DateFormatModule } from '../../../pipe/date-format/date-format.module';
import { IncludesModule } from '../../../pipe/includes/includes.module';
import { MapModule } from '../../map/map.module';
import { AccidentBaseDialogComponent } from './accident-base-dialog.component';

@NgModule({
  exports: [AccidentBaseDialogComponent],
  imports: [AsyncPipe, DateFormatModule, IncludesModule, MapModule, NgForOf, NgForTrackByFieldModule, NgIf],
  declarations: [AccidentBaseDialogComponent]
})
export class AccidentBaseDialogModule {}
