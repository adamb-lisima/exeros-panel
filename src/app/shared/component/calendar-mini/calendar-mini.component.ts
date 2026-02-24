import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { DateTime } from 'luxon';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import DateConst from '../../../const/date';
import { CalendarInput } from '../calendar/calendar.model';
import { SelectControl } from '../control/select-control/select-control.model';

interface CalendarCell {
  dayNumber: number | undefined;
  isAvailable: boolean;
  showIcon: boolean;
  has_telematics?: boolean;
  has_video?: boolean;
}

@Component({
  selector: 'app-calendar-mini',
  templateUrl: './calendar-mini.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host ::ng-deep select {
        appearance: none;
        -webkit-appearance: none;
        background-color: var(--white);
        color: var(--black);
        border-color: var(--platinum);
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right 0.5rem center;
        background-size: 1em;
      }

      :host ::ng-deep select option {
        background-color: var(--white);
        color: var(--black);
        border: 1px solid var(--platinum);
        border-radius: 0.375rem;
      }

      :host ::ng-deep select option {
        padding: 8px 12px;
        min-height: 1.5em;
      }

      :host ::ng-deep select option:hover,
      :host ::ng-deep select option:focus,
      :host ::ng-deep select option:active,
      :host ::ng-deep select option:checked {
        background-color: var(--bright-gray);
        color: var(--arsenic);
      }

      :host ::ng-deep select::-webkit-scrollbar {
        width: 8px;
      }

      :host ::ng-deep select::-webkit-scrollbar-track {
        background: var(--anti-flash-white);
        border-radius: 4px;
      }

      :host ::ng-deep select::-webkit-scrollbar-thumb {
        background: var(--chinese-silver);
        border-radius: 4px;
      }

      :host ::ng-deep select::-webkit-scrollbar-thumb:hover {
        background: var(--manatee);
      }
    `
  ]
})
export class CalendarMiniComponent implements OnInit, OnDestroy {
  readonly days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  readonly rows = [...new Array(6).keys()];
  readonly today = DateTime.now().setZone('Europe/London').startOf('day');
  _calendarInput: CalendarInput[] = [];
  calendar: CalendarCell[][] = [];
  dateHeader = '';
  selectedDay?: DateTime;
  selectedMonth: DateTime = this.getSavedMonth() ?? DateTime.now().setZone('Europe/London').startOf('day');

  private subscription = new Subscription();
  private readonly destroy$ = new Subject<void>();

  @Output() daySelect = new EventEmitter<DateTime>();
  @Output() monthChange = new EventEmitter<DateTime>();

  @Input() set calendarInput(v: CalendarInput[] | undefined | null) {
    this._calendarInput = v || [];
    this.showCalendar();
  }

  months: SelectControl[] = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: DateTime.fromObject({ month: i + 1 }).toFormat('MMMM')
  }));

  years: SelectControl[] = Array.from({ length: 11 }, (_, i) => {
    const year = this.today.year - 5 + i;
    return {
      value: year,
      label: year.toString()
    };
  });

  monthControl: FormControl<number | null>;
  yearControl: FormControl<number | null>;

  constructor(private readonly fb: FormBuilder) {
    this.monthControl = this.fb.control(this.selectedMonth.month);
    this.yearControl = this.fb.control(this.selectedMonth.year);
  }

  ngOnInit(): void {
    this.showCalendar();

    this.subscription.add(
      this.monthControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe({
        next: month => {
          if (month === null || month === undefined) return;

          const newDate = this.selectedMonth.set({ month });
          this.selectedMonth = newDate.startOf('day');
          this.showCalendar();
          this.monthChange.emit(this.selectedMonth);
        },
        error: (error: unknown) => console.error('Error in month control value changes:', error)
      })
    );

    this.subscription.add(
      this.yearControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe({
        next: year => {
          if (year === null || year === undefined) return;

          const newDate = this.selectedMonth.set({ year });
          this.selectedMonth = newDate.startOf('day');
          this.showCalendar();
          this.monthChange.emit(this.selectedMonth);
        },
        error: (error: unknown) => console.error('Error in year control value changes:', error)
      })
    );
  }

  handleDayClick(cell: CalendarCell): void {
    if (!cell.isAvailable || (!cell.has_video && !cell.has_telematics) || cell.dayNumber == null) {
      return;
    }

    this.selectedDay = this.selectedMonth.set({ day: cell.dayNumber });
    this.daySelect.emit(this.selectedDay);
  }

  showCalendar(): void {
    this.dateHeader = `${(this.selectedMonth ?? this.today).monthLong} ${(this.selectedMonth ?? this.today).year}`;

    const firstDayOfSelectedMonth = (this.selectedMonth ?? this.today).startOf('month').weekday - 1;
    const daysInMonth = (this.selectedMonth ?? this.today).daysInMonth;
    let date = 1;

    this.calendar = this.rows
      .map(row =>
        this.days.map((_, index) => {
          const dayNumber = (row === 0 && index < firstDayOfSelectedMonth) || typeof daysInMonth === 'undefined' || date > daysInMonth ? undefined : date++;
          const dayDate = (this.selectedMonth ?? this.today).set({ day: dayNumber }).toFormat(DateConst.serverDateFormat);
          const input = this._calendarInput.find(input => input.date === dayDate);

          const hasVideo = input?.has_video === true;
          const hasTelematics = input?.has_telematics === true;
          const isAvailable = !!dayNumber && !!input && (hasVideo || hasTelematics);

          const calendarCell: CalendarCell = {
            dayNumber,
            isAvailable,
            showIcon: isAvailable && input?.showIcon === true,
            has_video: hasVideo,
            has_telematics: hasTelematics
          };

          return calendarCell;
        })
      )
      .filter(row => row.some(calendarCell => calendarCell.dayNumber));
  }

  private getSavedMonth(): DateTime | null {
    const savedMonth = localStorage.getItem('calendar-mini-selected-month');
    return savedMonth ? DateTime.fromISO(savedMonth) : null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscription.unsubscribe();
  }
}
