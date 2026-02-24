import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DateTime } from 'luxon';
import DateConst from 'src/app/const/date';
import { CalendarInput } from 'src/app/shared/component/calendar/calendar.model';

interface CalendarCell {
  dayNumber: number | undefined;
  isAvailable: boolean;
  showIcon: boolean;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarComponent implements OnInit {
  readonly days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  readonly rows = [...new Array(6).keys()];
  readonly today = DateTime.now().setZone('Europe/London').startOf('day');
  _calendarInput: CalendarInput[] = [];
  calendar: CalendarCell[][] = [];
  dateHeader = '';
  selectedDay?: DateTime;
  selectedMonth?: DateTime;
  @Output() daySelect = new EventEmitter<DateTime>();
  @Output() monthChange = new EventEmitter<DateTime>();

  @Input() set calendarInput(v: CalendarInput[] | undefined | null) {
    this._calendarInput = v || [];
    this.selectedDay = undefined;
    this.showCalendar();
  }

  ngOnInit(): void {
    this.showCalendar();
  }

  handlePreviousMonthClick(): void {
    this.selectedMonth = (this.selectedMonth ?? this.today).minus({ month: 1 });
    this.showCalendar();
    this.monthChange.emit(this.selectedMonth);
  }

  handleNextMonthClick(): void {
    this.selectedMonth = (this.selectedMonth ?? this.today).plus({ month: 1 });
    this.showCalendar();
    this.monthChange.emit(this.selectedMonth);
  }

  handleDayClick(cell: CalendarCell): void {
    if (!cell.isAvailable || cell.dayNumber == null) {
      return;
    }
    this.selectedDay = (this.selectedDay ?? this.today).set({ day: cell.dayNumber });
    if (this.selectedMonth) {
      this.selectedDay = this.selectedDay.set({ month: this.selectedMonth.month });
    }
    this.daySelect.emit(this.selectedDay);
  }

  showCalendar(): void {
    this.dateHeader = `${(this.selectedMonth ?? this.today).monthLong} ${(this.selectedMonth ?? this.today).year}`;

    const firstDayOfSelectedMonth = (this.selectedMonth ?? this.today).startOf('month').weekday - 1;
    const daysInMonth = (this.selectedMonth ?? this.today).daysInMonth;
    let date = 1;
    this.calendar = this.rows
      .map(row =>
        this.days.map((_, cell) => {
          const dayNumber = (row === 0 && cell < firstDayOfSelectedMonth) || typeof daysInMonth === 'undefined' || date > daysInMonth ? undefined : date++;
          const dayDate = (this.selectedMonth ?? this.today).set({ day: dayNumber }).toFormat(DateConst.serverDateFormat);
          const input = this._calendarInput.find(input => input.date === dayDate);
          const isAvailable = !!dayNumber && !!input;

          return { dayNumber, isAvailable, showIcon: isAvailable && input.showIcon };
        })
      )
      .filter(row => row.some(cell => cell.dayNumber));
  }
}
