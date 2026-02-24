import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

interface CalendarCell {
  dayNumber: number | undefined;
  isAvailable: boolean;
  showIcon: boolean;
}

@Component({
  selector: 'app-time-select-control',
  templateUrl: './time-select-control.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimeSelectControlComponent),
      multi: true
    }
  ]
})
export class TimeSelectControlComponent implements OnChanges {
  @Input() label: string = 'Start time';
  @Input() currentTime: string = '';
  @Output() timeChange = new EventEmitter<string>();

  hours: string = '00';
  minutes: string = '00';

  onChange: any = () => {};
  onTouched: any = () => {};
  disabled: boolean = false;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentTime'] && changes['currentTime'].currentValue) {
      this.parseTimeValue(changes['currentTime'].currentValue);
    }
  }
  private parseTimeValue(value: string): void {
    if (!value) return;

    try {
      if (Array.isArray(value)) {
        if (value.length === 0) return;
        value = value[0];
      }

      value = String(value);

      const dateTimeMatch = value.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
      if (dateTimeMatch) {
        this.hours = dateTimeMatch[4];
        this.minutes = dateTimeMatch[5];
        this.cdr.markForCheck();
        return;
      }

      const timeMatch = value.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
      if (timeMatch) {
        this.hours = parseInt(timeMatch[1], 10).toString().padStart(2, '0');
        this.minutes = parseInt(timeMatch[2], 10).toString().padStart(2, '0');
        this.cdr.markForCheck();
        return;
      }
    } catch (error) {}
  }

  writeValue(value: string | any): void {
    this.parseTimeValue(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  incrementHours(): void {
    let hour = parseInt(this.hours);
    hour = (hour + 1) % 24;
    if (hour === 0) hour = 1;
    this.hours = hour.toString().padStart(2, '0');
    this.emitTimeChange();
  }

  decrementHours(): void {
    let hour = parseInt(this.hours);
    hour = hour - 1;
    if (hour <= 0) hour = 24;
    this.hours = hour.toString().padStart(2, '0');
    this.emitTimeChange();
  }

  incrementMinutes(): void {
    let minute = parseInt(this.minutes);
    minute = (minute + 1) % 60;
    this.minutes = minute.toString().padStart(2, '0');
    this.emitTimeChange();
  }

  decrementMinutes(): void {
    let minute = parseInt(this.minutes);
    minute = minute - 1;
    if (minute < 0) minute = 59;
    this.minutes = minute.toString().padStart(2, '0');
    this.emitTimeChange();
  }

  onHoursInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    this.hours = value;

    if (/^\d{2}$/.test(value)) {
      const numValue = parseInt(value, 10);
      if (numValue >= 0 && numValue <= 23) {
        this.emitTimeChange();
      }
    }
  }

  onMinutesInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    this.minutes = value;

    if (/^\d{2}$/.test(value)) {
      const numValue = parseInt(value, 10);
      if (numValue >= 0 && numValue <= 59) {
        this.emitTimeChange();
      }
    }
  }

  onHoursBlur(): void {
    let value = this.hours;

    if (!value || isNaN(parseInt(value, 10))) {
      this.hours = '00';
    } else {
      let numValue = parseInt(value, 10);
      numValue = Math.min(23, Math.max(0, numValue));
      this.hours = numValue.toString().padStart(2, '0');
    }

    this.emitTimeChange();
    this.cdr.markForCheck();
  }

  onMinutesBlur(): void {
    let value = this.minutes;

    if (!value || isNaN(parseInt(value, 10))) {
      this.minutes = '00';
    } else {
      let numValue = parseInt(value, 10);
      numValue = Math.min(59, Math.max(0, numValue));
      this.minutes = numValue.toString().padStart(2, '0');
    }

    this.emitTimeChange();
    this.cdr.markForCheck();
  }

  private emitTimeChange(): void {
    const timeString = `${this.hours}:${this.minutes}`;
    this.timeChange.emit(timeString);
    this.onChange(timeString);
    this.onTouched();
  }
}
