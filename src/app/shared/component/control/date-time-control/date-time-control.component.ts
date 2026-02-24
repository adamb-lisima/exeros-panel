import { CdkMenuTrigger } from '@angular/cdk/menu';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DateRange } from '@angular/material/datepicker';
import { DateTime } from 'luxon';
import DateConst from '../../../../const/date';
import { CalendarControlComponent } from '../calendar/calendar-control.component';

interface CalendarCell {
  day: number;
  active: boolean;
  date: DateTime;
}

interface SelectOption {
  value: number;
  label: string;
}

@Component({
  selector: 'app-date-time-control',
  templateUrl: './date-time-control.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimeControlComponent),
      multi: true
    }
  ]
})
export class DateTimeControlComponent implements ControlValueAccessor, OnInit, AfterViewInit {
  @Input() label: string = '';
  @Input() errorMessage: string = '';
  @Input() disabled: boolean = false;
  @Input() showHintSpace: boolean = true;
  @Input() timeLabel: string = 'Select Time';
  @Input() error: boolean = false;
  @Input() format: string = DateConst.serverDateTimeFormat;

  @Output() dateTimeChange = new EventEmitter<string>();

  @ViewChild('pickerContainer') pickerContainer!: ElementRef;
  @ViewChild('calendarControl') calendarControl!: CalendarControlComponent;
  @ViewChild(CdkMenuTrigger) menuTrigger!: CdkMenuTrigger;

  readonly days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  calendar: CalendarCell[][] = [];
  selectedDay: number | null = null;
  selectedMonth: number;
  selectedYear: number;
  months: SelectOption[] = [];
  years: SelectOption[] = [];

  dateTimeValue: DateTime | null = null;

  isMenuOpen: boolean = false;
  dropdownPosition = { top: 0, left: 0 };

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(private readonly cdr: ChangeDetectorRef) {
    const now = DateTime.now().setZone('Europe/London');
    this.selectedMonth = now.month;
    this.selectedYear = now.year;

    this.months = Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: DateTime.fromObject({ month: i + 1 }).toFormat('MMMM')
    }));

    const currentYear = now.year;
    this.years = Array.from({ length: 11 }, (_, i) => ({
      value: currentYear - 5 + i,
      label: (currentYear - 5 + i).toString()
    }));
  }

  ngOnInit(): void {
    this.dateTimeValue = DateTime.now().setZone('Europe/London');
    this.selectedDay = this.dateTimeValue.day;
    this.selectedMonth = this.dateTimeValue.month;
    this.selectedYear = this.dateTimeValue.year;
    this.updateCalendar();
    this.updateValue();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.cdr.markForCheck();
    }, 0);
  }

  updateCalendar(): void {
    this.calendar = [];

    const firstDayOfMonth = DateTime.fromObject({
      year: this.selectedYear,
      month: this.selectedMonth,
      day: 1
    });

    const firstDayOfWeek = firstDayOfMonth.weekday % 7;

    const daysInMonth = firstDayOfMonth.daysInMonth ?? 31;

    let currentRow: CalendarCell[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevMonthDate = firstDayOfMonth.minus({ days: firstDayOfWeek - i });
      currentRow.push({
        day: prevMonthDate.day,
        active: false,
        date: prevMonthDate
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = DateTime.fromObject({
        year: this.selectedYear,
        month: this.selectedMonth,
        day: day
      });

      currentRow.push({
        day: day,
        active: true,
        date: date
      });

      if (currentRow.length === 7) {
        this.calendar.push(currentRow);
        currentRow = [];
      }
    }

    if (currentRow.length > 0) {
      const lastDayOfMonth = DateTime.fromObject({
        year: this.selectedYear,
        month: this.selectedMonth,
        day: daysInMonth
      });

      let nextMonthDay = 1;
      while (currentRow.length < 7) {
        const nextMonthDate = lastDayOfMonth.plus({ days: nextMonthDay });
        currentRow.push({
          day: nextMonthDate.day,
          active: false,
          date: nextMonthDate
        });
        nextMonthDay++;
      }

      this.calendar.push(currentRow);
    }

    this.cdr.detectChanges();
  }

  handleDayClick(cell: CalendarCell): void {
    if (!cell.active) return;

    this.selectedDay = cell.day;

    if (this.dateTimeValue) {
      this.dateTimeValue = DateTime.fromObject({
        year: this.selectedYear,
        month: this.selectedMonth,
        day: this.selectedDay,
        hour: this.dateTimeValue.hour,
        minute: this.dateTimeValue.minute,
        second: 0,
        millisecond: 0
      });
    } else {
      this.dateTimeValue = DateTime.fromObject({
        year: this.selectedYear,
        month: this.selectedMonth,
        day: this.selectedDay,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
      });
    }

    this.updateValue();
    this.cdr.detectChanges();
  }

  get displayValue(): string {
    if (!this.dateTimeValue) return '';
    return this.dateTimeValue.toFormat('dd/MM/yyyy HH:mm');
  }

  handleCalendarSelection(): void {
    if (!this.calendarControl || !this.calendarControl.calendarValue || !this.calendarControl.calendarValue.start) {
      return;
    }

    const selectedDate = this.calendarControl.calendarValue.start;

    if (this.dateTimeValue) {
      this.dateTimeValue = selectedDate.set({
        hour: this.dateTimeValue.hour,
        minute: this.dateTimeValue.minute,
        second: 0,
        millisecond: 0
      });
    } else {
      this.dateTimeValue = selectedDate.startOf('day');
    }

    this.updateValue();
  }

  handleTimeChange(timeString: string) {
    if (!timeString) return;

    if (!this.dateTimeValue) {
      this.dateTimeValue = DateTime.now().setZone('Europe/London');
    }

    const [hoursStr, minutesStr] = timeString.split(':');

    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    this.dateTimeValue = this.dateTimeValue.set({
      hour: hours,
      minute: minutes,
      second: 0,
      millisecond: 0
    });

    this.updateValue();
    this.cdr.markForCheck();
  }

  private updateValue() {
    if (!this.dateTimeValue) return;

    const formattedValue = this.dateTimeValue.toFormat(this.format);

    this.onChange(formattedValue);

    this.dateTimeChange.emit(formattedValue);
  }

  writeValue(value: string | null): void {
    if (!value) {
      this.dateTimeValue = DateTime.now().setZone('Europe/London');
      this.initializeFromDateTime();
      return;
    }

    try {
      let parsedDateTime: DateTime | null;
      parsedDateTime = DateTime.fromFormat(value, this.format);
      if (!parsedDateTime.isValid) {
        parsedDateTime = DateTime.fromFormat(value, 'dd/MM/yyyy HH:mm');
      }

      if (!parsedDateTime.isValid) {
        parsedDateTime = DateTime.fromISO(value);
      }

      if (!parsedDateTime.isValid) {
        const match = value.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
        if (match) {
          parsedDateTime = DateTime.fromObject({
            year: parseInt(match[1], 10),
            month: parseInt(match[2], 10),
            day: parseInt(match[3], 10),
            hour: parseInt(match[4], 10),
            minute: parseInt(match[5], 10),
            second: parseInt(match[6], 10)
          });
        }
      }

      if (!parsedDateTime || !parsedDateTime.isValid) {
        parsedDateTime = DateTime.now().setZone('Europe/London');
      }

      this.dateTimeValue = parsedDateTime;

      this.initializeFromDateTime();
    } catch (error) {
      this.dateTimeValue = DateTime.now().setZone('Europe/London');
      this.initializeFromDateTime();
    }
  }

  private initializeFromDateTime(): void {
    if (!this.dateTimeValue) return;

    this.selectedDay = this.dateTimeValue.day;
    this.selectedMonth = this.dateTimeValue.month;
    this.selectedYear = this.dateTimeValue.year;

    this.updateCalendar();

    if (this.calendarControl) {
      this.calendarControl.calendarValue = new DateRange<DateTime | undefined>(this.dateTimeValue, undefined);
    }

    this.cdr.markForCheck();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isMenuOpen) return;

    const target = event.target as HTMLElement;
    if (this.pickerContainer && this.pickerContainer.nativeElement.contains(target)) return;
    if (target.closest('.date-time-menu-container')) return;

    this.isMenuOpen = false;
    this.onTouched();
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();

    if (!this.isMenuOpen) {
      const inputElement = this.pickerContainer.nativeElement;
      const rect = inputElement.getBoundingClientRect();

      const dropdownHeight = 380;

      this.dropdownPosition = {
        top: rect.top - dropdownHeight + window.scrollY,
        left: rect.left + window.scrollX
      };
    }

    this.isMenuOpen = !this.isMenuOpen;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  get currentTimeString(): string {
    if (!this.dateTimeValue) return '';
    return this.dateTimeValue.toFormat('HH:mm');
  }
}
