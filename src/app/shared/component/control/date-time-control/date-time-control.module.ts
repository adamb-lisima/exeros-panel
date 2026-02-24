import { CdkMenuModule } from '@angular/cdk/menu';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CalendarMiniModule } from '../../calendar-mini/calendar-mini.module';
import { CalendarControlModule } from '../calendar/calendar-control.module';
import { TimeSelectControlModule } from '../time-select-control/time-select-control.module';
import { DateTimeControlComponent } from './date-time-control.component';

@NgModule({
  declarations: [DateTimeControlComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, CdkMenuModule, CalendarControlModule, TimeSelectControlModule, CalendarMiniModule],
  exports: [DateTimeControlComponent]
})
export class DateTimeControlModule {}
