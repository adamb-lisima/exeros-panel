import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatLuxonDateModule } from '@angular/material-luxon-adapter';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RangeControlComponent } from 'src/app/shared/component/control/range-control/range-control.component';
import DateConst from '../../../../const/date';

@NgModule({
  declarations: [RangeControlComponent],
  imports: [CommonModule, FormsModule, MatInputModule, MatFormFieldModule, MatDatepickerModule, MatLuxonDateModule],
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
  exports: [RangeControlComponent]
})
export class RangeControlModule {}
