import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import DateConst from '../../../../const/date';
import { CalendarControlComponent } from './calendar-control.component';

@NgModule({
  declarations: [CalendarControlComponent],
  imports: [CommonModule, MatDatepickerModule],
  providers: [
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: [DateConst.clientDateFormat]
        },
        display: {
          dateInput: DateConst.clientDateFormat,
          monthYearLabel: 'MMM yyyy',
          dateA11yLabel: DateConst.clientDateFormat,
          monthYearA11yLabel: 'MMMM yyyy'
        }
      }
    }
  ],
  exports: [CalendarControlComponent]
})
export class CalendarControlModule {}
