import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatLuxonDateModule } from '@angular/material-luxon-adapter';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DateControlComponent } from 'src/app/shared/component/control/date-control/date-control.component';
import DateConst from '../../../../const/date';

@NgModule({
  declarations: [DateControlComponent],
  imports: [CommonModule, FormsModule, MatDatepickerModule, MatLuxonDateModule, MatFormFieldModule, MatInputModule],
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
  exports: [DateControlComponent]
})
export class DateControlModule {}
