import { CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { firstValueFrom, map, Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import DateConst from '../../../const/date';
import RouteConst from '../../../const/route';
import { SelectControl } from '../../../shared/component/control/select-control/select-control.model';
import { AuthSelectors } from '../../../store/auth/auth.selectors';
import { CommonObjectsSelectors } from '../../../store/common-objects/common-objects.selectors';
import { filterNullish } from '../../../util/operators';
import { StreamActions } from '../../stream/stream.actions';
import { StreamSelectors } from '../../stream/stream.selectors';

@Component({
  selector: 'app-playbacks-top',
  templateUrl: './playbacks-top.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaybacksTopComponent implements OnInit, OnDestroy {
  readonly selectedId$ = this.store.select(StreamSelectors.selectedId);
  readonly loggedInUser$ = this.store.select(AuthSelectors.loggedInUser);
  readonly liveFeed$ = this.store.select(StreamSelectors.liveFeed);
  currentCalendarMonth?: DateTime;
  readonly playback$ = this.store.select(StreamSelectors.playback);
  selectedDate?: DateTime;
  @ViewChild('calendarTrigger') calendarTrigger!: CdkMenuTrigger;
  private isInitialLoad = true;
  private isInitializingControls = false;
  private readonly destroy$ = new Subject<void>();
  isCalendarOpen = false;

  readonly calendarInput$ = this.store.select(StreamSelectors.playback).pipe(
    map(
      data =>
        data?.calendar.map(calendar => ({
          date: DateTime.fromFormat(calendar.date, DateConst.serverDateFormat).toFormat(DateConst.serverDateFormat),
          showIcon: Boolean(calendar.is_gps ?? calendar.has_video ?? calendar.has_telematics),
          has_video: Boolean(calendar.has_video),
          has_telematics: Boolean(calendar.has_telematics)
        })) ?? []
    )
  );

  readonly vehicleControl = this.fb.control<number | undefined>(undefined);
  readonly vehicleOptions$ = this.store.select(CommonObjectsSelectors.vehiclesTree).pipe(
    map((vehicles): SelectControl[] =>
      vehicles.map(vehicle => ({
        value: vehicle.id,
        label: vehicle.registration_plate,
        colorClass: vehicle.status === 'Active' ? 'text-extra-one' : undefined
      }))
    )
  );

  streamTypeControl = this.fb.control<'1' | '0'>('1');
  streamOptions: SelectControl<'1' | '0'>[] = [
    { label: 'Standard quality', value: '0' },
    { label: 'High quality', value: '1' }
  ];

  constructor(private readonly store: Store, private readonly router: Router, private readonly fb: FormBuilder, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.isInitializingControls = true;
    this.initSelectedIdListener();
    this.initVehicleControlListener();
    this.initStreamTypeListener();
    this.isInitializingControls = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async handleDaySelect(date: DateTime) {
    this.selectedDate = date;
    this.resetPlaybackStates();

    const stValue = this.streamTypeControl.value ?? '0';
    this.store.dispatch(
      StreamActions.setPlaybackParams({
        params: {
          date: date.toFormat(DateConst.serverDateFormat),
          st: stValue
        }
      })
    );

    this.store.dispatch(
      StreamActions.fetchPlaybackTimeline({
        params: {
          date: date.toFormat(DateConst.serverDateFormat),
          st: stValue
        }
      })
    );

    const playback = await firstValueFrom(this.playback$.pipe(filterNullish()));
    if (!playback?.has_video && playback?.has_telematics) {
      this.store.dispatch(
        StreamActions.fetchPlaybackScope({
          params: {
            start_time: date.startOf('day').toFormat(DateConst.serverDateTimeFormat),
            end_time: date.endOf('day').toFormat(DateConst.serverDateTimeFormat),
            st: stValue
          }
        })
      );
    }

    this.isCalendarOpen = false;
  }

  handleMonthChange(date: DateTime): void {
    this.currentCalendarMonth = date;
    this.store.dispatch(
      StreamActions.fetchPlayback({
        params: {
          date: date.toFormat(DateConst.serverDateFormat),
          st: this.streamTypeControl.value ?? '0'
        }
      })
    );
  }

  private initSelectedIdListener(): void {
    this.selectedId$
      .pipe(
        filterNullish(),
        takeUntil(this.destroy$),
        tap(selectedId => {
          this.vehicleControl.setValue(selectedId, { emitEvent: false });

          if (this.isInitialLoad) {
            this.handleInitialLoad();
            this.isInitialLoad = false;
          }
        })
      )
      .subscribe();
  }

  private initVehicleControlListener(): void {
    this.vehicleControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        tap(value => {
          if (this.isInitializingControls) return;

          this.selectedDate = undefined;
          this.resetDateStates();
          this.resetPlaybackStates();
          this.streamTypeControl.setValue('0', { emitEvent: false });

          const dateToUse = this.currentCalendarMonth ?? DateTime.now().setZone('Europe/London');
          const currentStreamType = this.streamTypeControl.value ?? '1';

          this.store.dispatch(
            StreamActions.setPlaybackParams({
              params: {
                st: currentStreamType,
                date: dateToUse.toFormat(DateConst.serverDateFormat)
              }
            })
          );
          this.router.navigate(['/', RouteConst.playbacks, value]).then(() => {
            this.resetPlaybackStates();
            const dateToUse = this.currentCalendarMonth ?? DateTime.now().setZone('Europe/London');

            if (this.currentCalendarMonth) {
              this.fetchPlayback(dateToUse, currentStreamType);
            }
          });
        })
      )
      .subscribe();
  }

  private initStreamTypeListener(): void {
    this.streamTypeControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          if (this.isInitializingControls) return;
          this.resetPlaybackStates();
          this.selectedDate = undefined;
          this.resetDateStates();

          const dateToUse = this.currentCalendarMonth ?? DateTime.now().setZone('Europe/London');
          this.fetchPlayback(dateToUse);
        })
      )
      .subscribe();
  }
  private handleInitialLoad(): void {
    const now = DateTime.now().setZone('Europe/London');
    this.selectedDate = now;

    this.resetPlaybackStates();
    this.fetchPlayback(now);
    this.fetchPlaybackTimeline(now);

    this.store.dispatch(
      StreamActions.fetchPlaybackScope({
        params: {
          start_time: now.startOf('day').toFormat(DateConst.serverDateTimeFormat),
          end_time: now.endOf('day').toFormat(DateConst.serverDateTimeFormat),
          st: this.streamTypeControl.value ?? '1'
        }
      })
    );

    this.cdr.detectChanges();
  }

  private resetPlaybackStates(): void {
    this.store.dispatch(StreamActions.resetPlaybackTimeline());
    this.store.dispatch(StreamActions.resetPlaybackScope());
    this.store.dispatch(StreamActions.resetPlaybackVideoCurrentTime());
    this.store.dispatch(StreamActions.setSelectedTrip({ tripIndex: null }));
    this.store.dispatch(StreamActions.resetTelemetryTimeline());
  }

  private resetDateStates(): void {
    this.selectedDate = undefined;
    this.currentCalendarMonth = undefined;
  }

  private getStreamType(): string {
    return this.streamTypeControl.value ?? '0';
  }

  private fetchPlayback(date: DateTime, streamType?: '0' | '1'): void {
    const stValue = streamType ?? this.getStreamType();

    this.store.dispatch(
      StreamActions.fetchPlayback({
        params: {
          date: date.toFormat(DateConst.serverDateFormat),
          st: stValue
        }
      })
    );
  }

  private fetchPlaybackTimeline(date: DateTime, streamType?: '0' | '1'): void {
    const stValue = streamType ?? this.getStreamType();

    this.store.dispatch(
      StreamActions.fetchPlaybackTimeline({
        params: {
          date: date.toFormat(DateConst.serverDateFormat),
          st: stValue
        }
      })
    );
  }

  toggleCalendar(): void {
    this.isCalendarOpen = !this.isCalendarOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isCalendarOpen) return;

    const target = event.target as HTMLElement;
    if (target.closest('.custom-select')) return;
    if (target.closest('app-calendar-mini')) return;
    if (target.closest('select') || target.closest('option')) return;

    this.isCalendarOpen = false;
  }
}
