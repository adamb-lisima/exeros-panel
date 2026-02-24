import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from 'src/app/shared/component/button/button.module';
import { CalendarComponent } from 'src/app/shared/component/calendar/calendar.component';

@NgModule({
  declarations: [CalendarComponent],
  imports: [CommonModule, ButtonModule],
  exports: [CalendarComponent]
})
export class CalendarModule {}
