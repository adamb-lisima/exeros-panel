import { CdkMenuTrigger } from '@angular/cdk/menu';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { map, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import DateConst from 'src/app/const/date';
import { RANGES } from '../../../const/ranges';
import { CalendarControlComponent } from '../../../shared/component/control/calendar/calendar-control.component';
import { CommonObjectsActions } from '../../../store/common-objects/common-objects.actions';
import { MapVehiclesParams } from '../../../store/common-objects/common-objects.model';
import { CommonObjectsSelectors } from '../../../store/common-objects/common-objects.selectors';
import ControlUtil from '../../../util/control';
import { DashboardSelectors } from '../../dashboard/dashboard.selectors';
import { AccessGroup } from '../../settings/settings.model';
import { StreamActions } from '../../stream/stream.actions';
import { StreamSelectors } from '../../stream/stream.selectors';

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
  selector: 'app-map-view-top',
  templateUrl: './map-view-top.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapViewTopComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  readonly accessGroup = AccessGroup;
  readonly DateConst = DateConst;
  readonly RANGES = RANGES;

  selectedRangeMessage$ = this.store.select(DashboardSelectors.rangeFilter).pipe(map(params => this.RANGES.find(range => range.getFrom() === params.from && range.getTo() === params.to)?.text ?? 'Custom'));
  sub?: Subscription;
  dateTimeValue: DateTime | null = null;
  private dateTimeChanged = false;
  onChange: any = () => {};
  onTouched: any = () => {};
  @Input() label: string = '';
  @Input() errorMessage: string = '';
  @Input() disabled: boolean = false;
  @Input() showHintSpace: boolean = true;
  @Input() timeForm: string = 'Time from';
  @Input() timeTo: string = 'Time to';
  @Input() error: boolean = false;
  @Input() format: string = DateConst.serverDateTimeFormat;
  isLoading: boolean = false;

  fromDateTime: DateTime | null = null;
  toDateTime: DateTime | null = null;

  @Output() dateTimeChange = new EventEmitter<string>();

  @ViewChild('pickerContainer') pickerContainer!: ElementRef;
  @ViewChild('calendarControl') calendarControl!: CalendarControlComponent;
  @ViewChild(CdkMenuTrigger) menuTrigger!: CdkMenuTrigger;
  private currentFilterParams: Partial<MapVehiclesParams> = {};

  readonly days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  calendar: CalendarCell[][] = [];
  selectedDay: number | null = null;
  selectedMonth: number;
  selectedYear: number;
  months: SelectOption[] = [];
  years: SelectOption[] = [];

  isMenuOpen: boolean = false;
  dropdownPosition = { top: 0, left: 0 };

  fleetOptions$ = this.store.select(CommonObjectsSelectors.fleetsTree).pipe(map(fleetsTree => ControlUtil.mapFleetsTreeToTreeControls(fleetsTree)));
  private userInteractedWithCalendar = false;

  constructor(private readonly cdr: ChangeDetectorRef, private readonly store: Store, private readonly actions$: Actions) {
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
    const now = DateTime.now().setZone('Europe/London');
    this.dateTimeValue = now;
    this.selectedDay = this.dateTimeValue.day;
    this.selectedMonth = this.dateTimeValue.month;
    this.selectedYear = this.dateTimeValue.year;

    this.fromDateTime = now.startOf('day');
    this.toDateTime = now.endOf('day');

    const formattedFrom = this.fromDateTime.toFormat(this.format);
    const formattedTo = this.toDateTime.toFormat(this.format);

    this.store.dispatch(
      StreamActions.setMapDateTime({
        from: formattedFrom,
        to: formattedTo
      })
    );

    this.updateCalendar();
    this.updateValue();

    this.store
      .select(StreamSelectors.mapFilterParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.currentFilterParams = params;
      });

    this.actions$.pipe(ofType(CommonObjectsActions.fetchMapVehicles, CommonObjectsActions.fetchMapVehiclesSuccess), takeUntil(this.destroy$)).subscribe(action => {
      if (action.type === CommonObjectsActions.fetchMapVehicles.type) {
        this.isLoading = true;
        this.cdr.markForCheck();
      } else if (action.type === CommonObjectsActions.fetchMapVehiclesSuccess.type) {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
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

    const firstDayOfWeek = firstDayOfMonth.weekday - 1;

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
    if (!cell.active) {
      this.selectedMonth = cell.date.month;
      this.selectedYear = cell.date.year;
      this.updateCalendar();
    }
    this.selectedDay = cell.day;

    const newDate = DateTime.fromObject({
      year: this.selectedYear,
      month: this.selectedMonth,
      day: this.selectedDay
    });

    if (this.fromDateTime) {
      this.fromDateTime = newDate.set({
        hour: this.fromDateTime.hour,
        minute: this.fromDateTime.minute,
        second: 0,
        millisecond: 0
      });
    } else {
      this.fromDateTime = newDate.set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
      });
    }

    if (this.toDateTime) {
      this.toDateTime = newDate.set({
        hour: this.toDateTime.hour,
        minute: this.toDateTime.minute,
        second: 0,
        millisecond: 0
      });
    } else {
      this.toDateTime = newDate.set({
        hour: 23,
        minute: 59,
        second: 0,
        millisecond: 0
      });
    }

    this.dateTimeValue = this.fromDateTime;

    this.dateTimeChanged = true;
    this.userInteractedWithCalendar = true;

    this.cdr.detectChanges();
  }

  handleSearchClick(): void {
    if (!this.fromDateTime || !this.toDateTime) {
      const now = DateTime.now().setZone('Europe/London');

      if (!this.fromDateTime) {
        this.fromDateTime = now.set({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0
        });
      }

      if (!this.toDateTime) {
        this.toDateTime = now.set({
          hour: 23,
          minute: 59,
          second: 0,
          millisecond: 0
        });
      }
    }

    const formattedFrom = this.fromDateTime.toFormat(this.format);
    const formattedTo = this.toDateTime.toFormat(this.format);

    this.store.dispatch(StreamActions.setMapDateTime({ from: formattedFrom, to: formattedTo }));

    let fleetId = this.currentFilterParams.fleet_id;

    if (!fleetId) {
      const savedFleetId = localStorage.getItem('exeros-fleet-id');
      if (savedFleetId) {
        fleetId = parseInt(savedFleetId, 10);
      }
    }

    const params: any = {
      ...this.currentFilterParams,
      from: formattedFrom,
      to: formattedTo
    };

    if (fleetId && !params.fleet_id) {
      params.fleet_id = fleetId;
    }

    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === null) {
        delete params[key];
      }
    });

    if (params.polygon && Array.isArray(params.polygon)) {
      params.polygon = JSON.stringify(params.polygon);
    }

    this.store.dispatch(
      CommonObjectsActions.fetchMapVehicles({
        params: params
      })
    );

    this.dateTimeChanged = false;
    this.isMenuOpen = false;
    this.cdr.detectChanges();
  }

  get displayValue(): string {
    if (!this.dateTimeValue) return '';
    return this.isNow ? 'Now' : this.dateTimeValue.toFormat('dd.MM.yyyy HH:mm');
  }

  handleTimeChange(timeString: string, timeField: 'from' | 'to') {
    if (!timeString) return;

    if (!this.dateTimeValue) {
      this.dateTimeValue = DateTime.now().setZone('Europe/London');
    }

    if (!this.fromDateTime || !this.toDateTime) {
      const currentDate = this.dateTimeValue ?? DateTime.now().setZone('Europe/London');

      if (!this.fromDateTime) {
        this.fromDateTime = currentDate.set({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0
        });
      }

      if (!this.toDateTime) {
        this.toDateTime = currentDate.set({
          hour: 23,
          minute: 59,
          second: 0,
          millisecond: 0
        });
      }
    }

    const [hoursStr, minutesStr] = timeString.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (timeField === 'from') {
      this.fromDateTime = this.fromDateTime.set({
        hour: hours,
        minute: minutes,
        second: 0,
        millisecond: 0
      });

      this.dateTimeValue = this.fromDateTime;
    } else {
      this.toDateTime = this.toDateTime.set({
        hour: hours,
        minute: minutes,
        second: 0,
        millisecond: 0
      });
    }

    this.dateTimeChanged = true;
    this.userInteractedWithCalendar = true;
    this.cdr.markForCheck();
  }

  private updateValue() {
    if (!this.dateTimeValue) return;

    const formattedValue = this.dateTimeValue.toFormat(this.format);

    this.onChange(formattedValue);
    this.dateTimeChange.emit(formattedValue);

    if (this.userInteractedWithCalendar) {
      const fromValue = this.fromDateTime?.toFormat(this.format) ?? formattedValue;
      const toValue = this.toDateTime?.toFormat(this.format) ?? formattedValue;
      this.store.dispatch(
        StreamActions.setMapDateTime({
          from: fromValue,
          to: toValue
        })
      );
    }
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

    this.fromDateTime = this.dateTimeValue;
    this.toDateTime = this.dateTimeValue;

    this.updateCalendar();

    this.cdr.markForCheck();
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();

    if (this.isMenuOpen) {
      this.isMenuOpen = false;
      this.userInteractedWithCalendar = true;

      if (this.dateTimeChanged && this.dateTimeValue) {
        this.triggerMapUpdate();
        this.dateTimeChanged = false;
      } else {
        this.triggerMapUpdate();
      }
    } else {
      const inputElement = this.pickerContainer.nativeElement;
      const rect = inputElement.getBoundingClientRect();

      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const dropdownHeight = 380;
      const offsetUp = 20;

      this.dropdownPosition = spaceBelow >= dropdownHeight || spaceBelow >= rect.top ? { top: rect.bottom + window.scrollY - offsetUp, left: rect.left + window.scrollX } : { top: rect.top - dropdownHeight + window.scrollY - offsetUp, left: rect.left + window.scrollX };

      this.isMenuOpen = true;
    }

    this.cdr.detectChanges();
  }

  get currentTimeString(): string {
    if (!this.dateTimeValue) return '';
    return this.dateTimeValue.toFormat('HH:mm');
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }

    this.destroy$.next();
    this.destroy$.complete();
  }

  triggerMapUpdate(): void {
    if (!this.fromDateTime || !this.toDateTime) return;

    const formattedFrom = this.fromDateTime.toFormat(this.format);
    const formattedTo = this.toDateTime.toFormat(this.format);

    if (this.userInteractedWithCalendar) {
      this.store.dispatch(StreamActions.setMapDateTime({ from: formattedFrom, to: formattedTo }));
    }

    if (!this.isMenuOpen) {
      let fleetId = this.currentFilterParams.fleet_id;

      if (!fleetId) {
        const savedFleetId = localStorage.getItem('exeros-fleet-id');
        if (savedFleetId) {
          fleetId = parseInt(savedFleetId, 10);
        }
      }

      const params: any = {
        ...this.currentFilterParams,
        from: formattedFrom,
        to: formattedTo
      };

      if (fleetId && !params.fleet_id) {
        params.fleet_id = fleetId;
      }

      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === null) {
          delete params[key];
        }
      });

      if (params.polygon && Array.isArray(params.polygon)) {
        params.polygon = JSON.stringify(params.polygon);
      }

      this.store.dispatch(
        CommonObjectsActions.fetchMapVehicles({
          params: params
        })
      );
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isMenuOpen) return;

    const target = event.target as HTMLElement;
    if (this.pickerContainer && this.pickerContainer.nativeElement.contains(target)) return;
    if (target.closest('.date-time-menu-container')) return;

    this.isMenuOpen = false;

    if (this.dateTimeChanged && this.dateTimeValue) {
      this.triggerMapUpdate();
      this.dateTimeChanged = false;
    }

    this.onTouched();
    this.cdr.detectChanges();
  }

  DateTimeNowHandler(): void {
    const now = DateTime.now().setZone('Europe/London');
    this.dateTimeValue = now;
    this.fromDateTime = now;
    this.toDateTime = now;

    const formattedFrom = null;
    const formattedTo = null;

    this.selectedDay = this.dateTimeValue.day;
    this.selectedMonth = this.dateTimeValue.month;
    this.selectedYear = this.dateTimeValue.year;
    this.updateCalendar();

    this.store.dispatch(StreamActions.setMapDateTime({ from: formattedFrom, to: formattedTo }));

    const params: any = {
      from: formattedFrom,
      to: formattedTo,
      ...this.currentFilterParams
    };

    Object.keys(params).forEach(key => {
      if (params[key] === undefined) {
        delete params[key];
      }
    });

    if (params.polygon && Array.isArray(params.polygon)) {
      params.polygon = JSON.stringify(params.polygon);
    }

    this.store.dispatch(
      CommonObjectsActions.fetchMapVehicles({
        params: params
      })
    );

    this.cdr.detectChanges();
  }

  get fromTimeString(): string {
    if (!this.fromDateTime) return '';
    return this.fromDateTime.toFormat('HH:mm');
  }

  get toTimeString(): string {
    if (!this.toDateTime) return '';
    return this.toDateTime.toFormat('HH:mm');
  }

  get isNow(): boolean {
    return this.isDateTimeNow(this.dateTimeValue);
  }

  private isDateTimeNow(dateTime: DateTime | null): boolean {
    if (!dateTime) return false;

    const now = DateTime.now().setZone('Europe/London');
    const diffInSeconds = Math.abs(dateTime.diff(now, 'seconds').seconds);
    return diffInSeconds < 60;
  }
}
