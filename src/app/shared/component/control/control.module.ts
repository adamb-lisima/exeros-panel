import { NgForOf, NgIf } from '@angular/common';
import { NgModule } from '@angular/core';
import { CalendarControlModule } from './calendar/calendar-control.module';
import { CheckboxControlModule } from './checkbox-control/checkbox-control.module';
import { DateControlModule } from './date-control/date-control.module';
import { DateTimeControlModule } from './date-time-control/date-time-control.module';
import { MultiselectTreeModule } from './multiselect-tree/multiselect-tree.module';
import { RangeControlModule } from './range-control/range-control.module';
import { SelectControlShowFilterModule } from './select-control-show-filter/select-control-show-filter.module';
import { SelectControlModule } from './select-control/select-control.module';
import { TextControlModule } from './text-control/text-control.module';
import { TextDescriptionControlModule } from './text-description-control/text-description-control.module';
import { TextareaControlModule } from './textarea-control/textarea-control.module';
import { TimeControlModule } from './time-control/time-control.module';
import { TreeControlModule } from './tree-control/tree-control.module';

@NgModule({
  exports: [TextControlModule, SelectControlModule, CheckboxControlModule, DateControlModule, TreeControlModule, TimeControlModule, RangeControlModule, TextareaControlModule, CalendarControlModule, MultiselectTreeModule, SelectControlShowFilterModule, TextDescriptionControlModule, DateTimeControlModule],
  imports: [NgForOf, NgIf]
})
export class ControlModule {}
