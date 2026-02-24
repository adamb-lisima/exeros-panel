import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { catchError, combineLatest, filter, first, map, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import DateConst from '../../../../const/date';
import { SelectControl } from '../../../../shared/component/control/select-control/select-control.model';
import { ClipToEvent } from '../../../../store/download-task/download-task.model';
import { firstNonNullish, waitOnceForAction } from '../../../../util/operators';
import { StreamActions } from '../../stream.actions';
import { CameraInfo } from '../../stream.model';
import { StreamSelectors } from '../../stream.selectors';
import { StreamCorePlaybackChartsClipToEventData } from './stream-core-playback-charts-clip-to-event.model';

@Component({
  selector: 'app-stream-core-playback-charts-clip-to-event',
  templateUrl: './stream-core-playback-charts-clip-to-event.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StreamCorePlaybackChartsClipToEventComponent implements OnDestroy {
  streamType$ = this.store.select(StreamSelectors.playbackStreamType);
  selectedDuration: number = 30;
  selectedStream: 'main_stream' | 'sub_stream' = 'sub_stream';
  playback$ = this.store.select(StreamSelectors.playback).pipe(firstNonNullish());
  private readonly destroy$ = new Subject<void>();

  cameras$: Observable<CameraInfo[]> = this.playback$.pipe(map(playback => playback.cameras ?? []));

  bodyGroup = this.fb.group<Nullable<Pick<ClipToEvent, 'name' | 'from' | 'to' | 'stream'>>>({
    name: '',
    from: DateTime.fromJSDate(this.data.startTime).toFormat(DateConst.timeFormat),
    to: '',
    stream: 'sub_stream'
  });

  handleCloseClick(): void {
    this.dialogRef.close();
  }

  selectedCameras: CameraInfo[] = [];

  clipDurations = [
    { label: '10s', value: 10 },
    { label: '30s', value: 30 },
    { label: '1m', value: 60 },
    { label: '3m', value: 180 },
    { label: '5m', value: 300 }
  ];

  streamOptions: SelectControl<'main_stream' | 'sub_stream'>[] = [
    { label: 'High quality', value: 'main_stream' },
    { label: 'Standard quality', value: 'sub_stream' }
  ];

  isSubmitting = false;
  submitError: string | null = null;

  constructor(@Inject(DIALOG_DATA) public data: StreamCorePlaybackChartsClipToEventData, private readonly dialogRef: DialogRef, private readonly store: Store, private readonly fb: FormBuilder, private readonly actions$: Actions) {
    this.store
      .select(StreamSelectors.playbackStreamType)
      .pipe(
        first(),
        takeUntil(this.destroy$),
        tap(streamType => {
          const initialStream = streamType === '1' ? 'main_stream' : 'sub_stream';
          this.selectedStream = initialStream;
          this.bodyGroup.patchValue({ stream: initialStream });
        })
      )
      .subscribe();

    this.streamType$
      .pipe(
        takeUntil(this.destroy$),
        tap(streamType => {
          this.selectedStream = streamType === '1' ? 'main_stream' : 'sub_stream';
          this.bodyGroup?.patchValue({ stream: this.selectedStream }, { emitEvent: false });
        })
      )
      .subscribe();
  }

  trackByCamera(index: number, camera: CameraInfo): number {
    return camera.id;
  }

  toggleSelection(camera: CameraInfo): void {
    const index = this.selectedCameras.findIndex(selectedCamera => selectedCamera.id === camera.id);
    if (index === -1) {
      this.selectedCameras.push(camera);
    } else {
      this.selectedCameras.splice(index, 1);
    }
  }

  isSelected(camera: CameraInfo): boolean {
    return this.selectedCameras.some(selectedCamera => selectedCamera.id === camera.id);
  }

  updateDuration(duration: number): void {
    this.selectedDuration = duration;
  }

  handleClipToEventClick(): void {
    if (!this.bodyGroup.valid || this.selectedCameras.length === 0) {
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;

    const { name, from, stream = 'sub_stream' } = this.bodyGroup.value;
    const defaultStartTime = DateTime.fromJSDate(this.data.startTime);

    const startDateTime = from
      ? DateTime.fromFormat(from, DateConst.timeFormat).set({
          year: defaultStartTime.year,
          month: defaultStartTime.month,
          day: defaultStartTime.day
        })
      : defaultStartTime;

    const endDateTime = startDateTime.plus({ seconds: this.selectedDuration });

    combineLatest([this.store.select(StreamSelectors.playback).pipe(firstNonNullish())])
      .pipe(
        first(),
        filter(([playback]) => !!playback),
        takeUntil(this.destroy$),
        tap(([playback]) => {
          const channelsMap = new Map(playback!.cameras!.map(camera => [camera.name, camera.id]));
          const channels = this.selectedCameras.map(camera => channelsMap.get(camera.name)).filter((channel): channel is number => channel !== undefined);

          if (channels.length > 0) {
            const interfaceBody: ClipToEvent = {
              name: name!,
              channels,
              from: startDateTime.toFormat(DateConst.serverDateTimeFormat),
              to: endDateTime.toFormat(DateConst.serverDateTimeFormat),
              stream: stream!
            };

            const apiBody = {
              ...interfaceBody,
              stream: stream === 'main_stream' ? 1 : 0
            };

            this.store.dispatch(
              StreamActions.clipToEvent({
                vehicleId: playback.id,
                body: apiBody as any
              })
            );
          }
        }),
        switchMap(() =>
          this.actions$.pipe(
            waitOnceForAction([StreamActions.clipToEventSuccess]),
            takeUntil(this.destroy$),
            tap(() => {
              this.isSubmitting = false;
              this.dialogRef.close();
            }),
            catchError(error => {
              this.isSubmitting = false;
              this.submitError = 'Failed to create event from clip. Please try again.';
              return of(error);
            })
          )
        )
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
