import { CdkMenuModule } from '@angular/cdk/menu';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'src/app/shared/component/button/button.module';
import { SelectControlModule } from '../control/select-control/select-control.module';
import { CalendarMiniComponent } from './calendar-mini.component';
import { CalendarSelectComponent } from './calendar-select/calendar-select.component';

@NgModule({
  declarations: [CalendarMiniComponent, CalendarSelectComponent],
  imports: [FormsModule, CdkMenuModule, CommonModule, ButtonModule, ReactiveFormsModule, CommonModule, SelectControlModule],
  exports: [CalendarMiniComponent]
})
export class CalendarMiniModule {}
