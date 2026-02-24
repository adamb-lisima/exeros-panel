import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { catchError, of, Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import DateConst from '../../../../const/date';
import { ClipToEvent, ExtendEvent } from '../../../../store/download-task/download-task.model';
import { waitOnceForAction } from '../../../../util/operators';
import { StreamActions } from '../../../stream/stream.actions';
import { EventCoreExtendEventData } from './events-core-extend-event.model';

@Component({
  selector: 'app-events-core-extend-event',
  templateUrl: './events-core-extend-event.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsCoreExtendEventComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  selectedDurationBefore: number = 0;
  selectedDurationAfter: number = 0;

  bodyGroup = this.fb.group<Nullable<Pick<ClipToEvent, 'name' | 'from' | 'to'>>>({
    name: '',
    from: DateTime.fromFormat(this.data.occurence_start_time!, 'yyyy-MM-dd HH:mm:ss').toFormat(DateConst.timeFormat),
    to: DateTime.fromFormat(this.data.occurence_end_time!, 'yyyy-MM-dd HH:mm:ss').toFormat(DateConst.timeFormat)
  });

  clipDurations = [
    { label: '0s', value: 0 },
    { label: '10s', value: 10 },
    { label: '30s', value: 30 },
    { label: '1m', value: 60 },
    { label: '3m', value: 180 }
  ];
  constructor(@Inject(DIALOG_DATA) public data: EventCoreExtendEventData, private readonly dialogRef: DialogRef, private readonly store: Store, private readonly fb: FormBuilder, private readonly actions$: Actions) {}

  handleCloseClick(): void {
    this.dialogRef.close();
  }

  private mergeDateWithTime(originalDateTime: string, time?: string | null): string {
    const origDt = DateTime.fromFormat(originalDateTime, 'yyyy-MM-dd HH:mm:ss');
    if (!origDt.isValid) return originalDateTime;

    if (!time) return originalDateTime;

    const timeWithSeconds = /^\d{2}:\d{2}$/.test(time) ? `${time}:00` : time;

    const candidate = `${origDt.toFormat('yyyy-MM-dd')} ${timeWithSeconds}`;
    const merged = DateTime.fromFormat(candidate, 'yyyy-MM-dd HH:mm:ss');

    return merged.isValid ? merged.toFormat('yyyy-MM-dd HH:mm:ss') : originalDateTime;
  }

  handleExtendEventClick(): void {
    const formFrom = this.bodyGroup.get('from')?.value;
    const formTo = this.bodyGroup.get('to')?.value;

    const fromFull = this.mergeDateWithTime(this.data.occurence_start_time!, formFrom);
    const toFull = this.mergeDateWithTime(this.data.occurence_end_time!, formTo);

    const apiBody: ExtendEvent = {
      from: fromFull,
      to: toFull,
      name: this.bodyGroup.get('name')?.value ?? ''
    };

    this.store.dispatch(
      StreamActions.extendEvent({
        eventId: this.data.id,
        body: apiBody
      })
    );

    this.actions$
      .pipe(
        waitOnceForAction([StreamActions.extendEventSuccess]),
        tap(() => {
          this.dialogRef.close();
        }),
        catchError(error => {
          console.error('Failed to extend event:', error);
          return of(error);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  isCreateEventDisabled(): boolean {
    const fromValue = this.bodyGroup.controls.from.value;
    const toValue = this.bodyGroup.controls.to.value;

    if (!fromValue || !toValue) {
      return true;
    }

    const from = DateTime.fromFormat(fromValue, DateConst.timeFormat);
    const to = DateTime.fromFormat(toValue, DateConst.timeFormat);

    const diffInMinutes = to.diff(from, 'minutes').minutes;

    return diffInMinutes > 5;
  }

  updateDuration(duration: number, type: 'before' | 'after'): void {
    if (type === 'before') {
      this.selectedDurationBefore = duration;
      this.bodyGroup.controls.from.setValue(DateTime.fromFormat(this.data.occurence_start_time!, 'yyyy-MM-dd HH:mm:ss').minus({ seconds: duration }).toFormat(DateConst.timeFormat));
    }
    if (type === 'after') {
      this.selectedDurationAfter = duration;
      this.bodyGroup.controls.to.setValue(DateTime.fromFormat(this.data.occurence_end_time!, 'yyyy-MM-dd HH:mm:ss').plus({ seconds: duration }).toFormat(DateConst.timeFormat));
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
