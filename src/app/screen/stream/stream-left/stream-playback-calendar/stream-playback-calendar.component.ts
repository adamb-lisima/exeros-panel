import { ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { map, Subject, Subscription, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import DateConst from '../../../../const/date';
import RouteConst, { SubRouteConst } from '../../../../const/route';
import { CalendarInput } from '../../../../shared/component/calendar/calendar.model';
import { SelectControl } from '../../../../shared/component/control/select-control/select-control.model';
import { CommonObjectsSelectors } from '../../../../store/common-objects/common-objects.selectors';
import { filterNullish } from '../../../../util/operators';
import { StreamActions } from '../../stream.actions';
import { StreamSelectors } from '../../stream.selectors';

@Component({
  selector: 'app-stream-playback-calendar',
  templateUrl: './stream-playback-calendar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StreamPlaybackCalendarComponent implements OnInit, OnDestroy {
  @Output() collapseChange = new EventEmitter<boolean>();

  isCollapsed = false;
  vehicleControl = this.fb.control<number | undefined>(undefined);
  vehicleOptions$ = this.store.select(CommonObjectsSelectors.vehiclesTree).pipe(
    map((vehicles): SelectControl[] =>
      vehicles.map(vehicle => ({
        value: vehicle.id,
        label: vehicle.registration_plate,
        colorClass: vehicle.status === 'Active' ? 'text-extra-one' : undefined
      }))
    )
  );
  calendarInput$ = this.store.select(StreamSelectors.playback).pipe(
    map(
      data =>
        data?.calendar.map(
          (calendar): CalendarInput => ({
            date: DateTime.fromFormat(calendar.date, DateConst.serverDateFormat).toFormat(DateConst.serverDateFormat),
            showIcon: calendar.is_gps
          })
        ) ?? []
    )
  );

  streamTypeControl = this.fb.control<'1' | '0'>('1');
  streamOptions: SelectControl<'1' | '0'>[] = [
    { label: 'Sub stream', value: '0' },
    { label: 'Main stream', value: '1' }
  ];

  private readonly sub = new Subscription();
  private readonly destroy$ = new Subject<void>();

  selectedDate?: DateTime;

  constructor(private readonly store: Store, private readonly fb: FormBuilder, private readonly router: Router) {}

  ngOnInit(): void {
    const selectedIdSub = this.store
      .select(StreamSelectors.selectedId)
      .pipe(
        filterNullish(),
        tap(selectedId => this.vehicleControl.reset(selectedId, { emitEvent: false })),
        takeUntil(this.destroy$)
      )
      .subscribe();
    this.sub.add(selectedIdSub);

    const vehicleControlSub = this.vehicleControl.valueChanges
      .pipe(
        tap(value => this.router.navigate(['/', RouteConst.stream, value, SubRouteConst.playback])),
        takeUntil(this.destroy$)
      )
      .subscribe();
    this.sub.add(vehicleControlSub);

    const streamTypeControlSub = this.streamTypeControl.valueChanges
      .pipe(
        tap(() => {
          this.isCollapsed = false;
          this.collapseChange.emit(false);
          this.store.dispatch(StreamActions.resetPlaybackTimeline());
          this.store.dispatch(StreamActions.resetPlaybackScope());
          this.store.dispatch(StreamActions.resetPlaybackVideoCurrentTime());
          this.store.dispatch(
            StreamActions.fetchPlayback({
              params: {
                date: DateTime.now().setZone('Europe/London').toFormat(DateConst.serverDateFormat),
                st: this.streamTypeControl.value ?? '0'
              }
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
    this.sub.add(streamTypeControlSub);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleMonthChange(date: DateTime): void {
    this.store.dispatch(StreamActions.resetPlaybackTimeline());
    this.store.dispatch(StreamActions.resetPlaybackScope());
    this.store.dispatch(StreamActions.resetPlaybackVideoCurrentTime());
    this.store.dispatch(
      StreamActions.fetchPlayback({
        params: {
          date: date.toFormat(DateConst.serverDateFormat),
          st: this.streamTypeControl.value ?? '0'
        }
      })
    );
  }

  handleDaySelect(date: DateTime): void {
    this.selectedDate = date;
    this.isCollapsed = true;
    this.collapseChange.emit(true);
    this.store.dispatch(StreamActions.resetPlaybackTimeline());
    this.store.dispatch(StreamActions.resetPlaybackScope());
    this.store.dispatch(StreamActions.resetPlaybackVideoCurrentTime());
    this.store.dispatch(
      StreamActions.fetchPlaybackTimeline({
        params: {
          date: date.toFormat(DateConst.serverDateFormat),
          st: this.streamTypeControl.value ?? '0'
        }
      })
    );
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    this.collapseChange.emit(this.isCollapsed);
  }
}
