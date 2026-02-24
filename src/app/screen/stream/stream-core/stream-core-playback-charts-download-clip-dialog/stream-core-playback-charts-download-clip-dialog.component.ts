import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { catchError, combineLatest, filter, first, map, Observable, of, startWith, Subject, Subscription, switchMap, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import DateConst from 'src/app/const/date';
import { StreamSelectors } from 'src/app/screen/stream/stream.selectors';
import { SelectControl } from 'src/app/shared/component/control/select-control/select-control.model';
import { downloadTaskCreate, downloadTaskCreateSuccess } from 'src/app/store/download-task/download-task.actions';
import { DownloadTaskCreateBody } from 'src/app/store/download-task/download-task.model';
import { firstNonNullish, waitOnceForAction } from 'src/app/util/operators';
import { CameraInfo } from '../../stream.model';
import { StreamCorePlaybackChartsDownloadClipDialogData } from './stream-core-playback-charts-download-clip-dialog.model';

interface ClipDuration {
  label: string;
  value: number;
}

@Component({
  selector: 'app-stream-core-playback-charts-download-clip-dialog',
  templateUrl: './stream-core-playback-charts-download-clip-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StreamCorePlaybackChartsDownloadClipDialogComponent implements OnDestroy {
  streamType$ = this.store.select(StreamSelectors.playbackStreamType);
  playback$ = this.store.select(StreamSelectors.playback).pipe(firstNonNullish());
  cameras$: Observable<CameraInfo[]> = this.playback$.pipe(map(playback => playback.cameras ?? []));
  selectedDuration: number = 30;

  private readonly destroy$ = new Subject<void>();
  private subscriptions = new Subscription();

  streamOptions: SelectControl<'main_stream' | 'sub_stream'>[] = [
    { label: 'High quality', value: 'main_stream' },
    { label: 'Standard quality', value: 'sub_stream' }
  ];
  selectedStream: 'main_stream' | 'sub_stream' = 'sub_stream';

  bodyGroup = this.fb.group<Nullable<Pick<DownloadTaskCreateBody, 'name' | 'from' | 'to' | 'stream'>>>({
    name: '',
    from: DateTime.fromJSDate(this.data.startTime).toFormat(DateConst.timeFormat),
    to: '',
    stream: null
  });

  selectedCameras: CameraInfo[] = [];

  provider$ = this.playback$.pipe(map(playback => playback.priority_provider_type));

  isProviderSupported$ = this.provider$.pipe(map(provider => provider === 'STREAMAX' || provider === 'FT_CLOUD'));

  clipDurations$: Observable<ClipDuration[]> = combineLatest([this.provider$, this.streamType$.pipe(map(streamType => (streamType === '1' ? 'main_stream' : 'sub_stream'))), this.bodyGroup.controls.stream.valueChanges.pipe(startWith(this.bodyGroup.controls.stream.value))]).pipe(
    map(([provider, streamTypeFromStore, streamFromControl]) => {
      const stream = streamFromControl ?? streamTypeFromStore;
      return this.getClipDurationsForProvider(provider, stream as 'main_stream' | 'sub_stream');
    })
  );

  constructor(@Inject(DIALOG_DATA) public data: StreamCorePlaybackChartsDownloadClipDialogData, private readonly dialogRef: DialogRef, private readonly store: Store, private readonly actions$: Actions, private readonly httpClient: HttpClient, private readonly fb: FormBuilder) {
    let initialStreamType: string = '0';

    this.store
      .select(StreamSelectors.playbackStreamType)
      .pipe(first(), takeUntil(this.destroy$))
      .subscribe(streamType => {
        initialStreamType = streamType;
      });

    const initialStream = initialStreamType === '1' ? 'main_stream' : 'sub_stream';
    this.selectedStream = initialStream;
    this.bodyGroup.patchValue({ stream: initialStream });

    const streamUpdateSub = this.streamType$
      .pipe(
        tap(streamType => {
          this.selectedStream = streamType === '1' ? 'main_stream' : 'sub_stream';
          this.bodyGroup?.patchValue({ stream: this.selectedStream });
        }),
        catchError((error: unknown) => {
          console.error('Error updating stream type:', error);
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        error: (error: unknown) => {
          console.error('Error in stream type update subscription:', error);
        }
      });

    this.subscriptions.add(streamUpdateSub);

    const durationAdjustmentSub = this.clipDurations$
      .pipe(
        tap(durations => {
          const maxDuration = Math.max(...durations.map(d => d.value));
          if (this.selectedDuration > maxDuration) {
            this.selectedDuration = maxDuration;
          }
        }),
        catchError((error: unknown) => {
          console.error('Error adjusting duration:', error);
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        error: (error: unknown) => {
          console.error('Error in duration adjustment subscription:', error);
        }
      });

    this.subscriptions.add(durationAdjustmentSub);
  }

  private getClipDurationsForProvider(provider: string, stream: 'main_stream' | 'sub_stream'): ClipDuration[] {
    const baseDurations: ClipDuration[] = [
      { label: '10s', value: 10 },
      { label: '30s', value: 30 },
      { label: '1m', value: 60 },
      { label: '3m', value: 180 },
      { label: '5m', value: 300 }
    ];

    if (provider !== 'FT_CLOUD') {
      return baseDurations;
    }

    const extendedDurations: ClipDuration[] = [...baseDurations, { label: '10m', value: 600 }, { label: '15m', value: 900 }, { label: '30m', value: 1800 }];

    if (stream === 'main_stream') {
      return extendedDurations;
    }

    return [...extendedDurations, { label: '60m', value: 3600 }, { label: '90m', value: 5400 }, { label: '120m', value: 7200 }];
  }

  handleCloseClick(): void {
    this.dialogRef.close();
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

  handleDownloadClick(): void {
    if (!this.bodyGroup.valid) return;

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

    const downloadSub = combineLatest([this.store.select(StreamSelectors.playback).pipe(firstNonNullish())])
      .pipe(
        first(),
        filter(([playback]) => !!playback),
        tap(([playback]) => {
          const channelsMap = new Map(playback!.cameras!.map(camera => [camera.name, camera.id]));
          const channels = this.selectedCameras.map(camera => channelsMap.get(camera.name)).filter((channel): channel is number => channel !== undefined);

          if (channels.length > 0) {
            this.store.dispatch(
              downloadTaskCreate({
                id: playback.id,
                body: {
                  name: name!,
                  channels,
                  from: startDateTime.toFormat(DateConst.serverDateTimeFormat),
                  to: endDateTime.toFormat(DateConst.serverDateTimeFormat),
                  stream: stream!
                }
              })
            );
          }
        }),
        switchMap(() =>
          this.actions$.pipe(
            waitOnceForAction([downloadTaskCreateSuccess]),
            tap(() => this.dialogRef.close())
          )
        ),
        catchError((error: unknown) => {
          console.error('Error in download operation:', error);
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        error: (error: unknown) => {
          console.error('Error in download subscription:', error);
        }
      });

    this.subscriptions.add(downloadSub);
  }

  updateDuration(duration: number): void {
    this.selectedDuration = duration;
  }

  trackByCamera(index: number, camera: CameraInfo): number {
    return camera.id;
  }

  trackByDuration(index: number, duration: ClipDuration): number {
    return duration.value;
  }

  protected readonly StreamSelectors = StreamSelectors;

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.unsubscribe();
  }
}
