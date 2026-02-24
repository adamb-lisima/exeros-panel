import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DateRange } from '@angular/material/datepicker';
import { DateTime } from 'luxon';
import DateConst from '../../../../const/date';
import { ControlComponent } from '../control.component';

@Component({
  selector: 'app-calendar-control',
  templateUrl: './calendar-control.component.html',
  providers: [{ provide: NG_VALUE_ACCESSOR, multi: true, useExisting: CalendarControlComponent }]
})
export class CalendarControlComponent extends ControlComponent<(DateTime | string)[]> implements AfterViewInit {
  calendarValue?: DateRange<DateTime | undefined>;
  @Output() selectEvent = new EventEmitter<void>();
  @Input() format = DateConst.serverDateTimeFormat;

  ngAfterViewInit(): void {
    const [start, end] = this.value ?? [];
    this.calendarValue = new DateRange<DateTime | undefined>(start ? DateTime.fromFormat(start as string, this.format) : undefined, end ? DateTime.fromFormat(end as string, this.format) : undefined);
  }

  handleValueChange(date: DateTime | undefined | null): void {
    if (!date) {
      return;
    }
    const start = this.calendarValue?.start;
    const end = this.calendarValue?.end;
    if (start && date >= start && !end) {
      const endDateTime = date.endOf('day');
      this.calendarValue = new DateRange(start, endDateTime);
      super.handleModelChange([start.toFormat(this.format), endDateTime.toFormat(this.format)]);
    } else {
      this.calendarValue = new DateRange(date.startOf('day'), undefined);
    }
  }
}
