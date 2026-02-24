import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { DateTime } from 'luxon';
import { Subject, Subscription, switchMap, tap, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'player-root',
  templateUrl: './player.component.html'
})
export class PlayerComponent implements OnDestroy {
  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;
  form = new UntypedFormGroup({
    url: new UntypedFormControl('http://test.trackeyeplayer2.co.uk:8091'),
    deviceId: new UntypedFormControl('007100679A'),
    channel: new UntypedFormControl('1'),
    startTime: new UntypedFormControl('2022-07-13 02:00:00'),
    sn: new UntypedFormControl(DateTime.now().setZone('Europe/London').valueOf()),
    st: new UntypedFormControl(0)
  });
  private sub?: Subscription;
  private player?: streamaxPlayer.default;
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly httpClient: HttpClient) {}

  ngOnDestroy(): void {
    this.destroy();
    this.destroy$.next();
    this.destroy$.complete();
  }

  handlePlayClick(): void {
    const { url, deviceId, channel, startTime, sn, st } = this.form.value;
    const formattedStartTime = DateTime.fromFormat(startTime, 'yyyy-MM-dd HH:mm:ss').toFormat('yyyyMMddHHmmss');
    const init = `${url}/rqplayback.flv?devid=${deviceId}&chl=${channel}&svrip=127.0.0.1&svrport=17891&st=${st}&audio=1&starttime=${formattedStartTime}&sn=${sn}`;
    const everyFiveSecond = `${url}/heart.flv?sn=${sn}`;
    const result = `${url}/play.flv?devid=${deviceId}&chl=${channel}&svrip=127.0.0.1&svrport=17891&st=${st}&audio=1&starttime=${formattedStartTime}&sn=${sn}`;

    console.info({ init, everyFiveSecond, result });

    this.destroy();

    this.sub = new Subscription();

    this.sub.add(
      this.httpClient
        .get(init)
        .pipe(
          tap(() =>
            this.sub?.add(
              timer(0, 5000)
                .pipe(
                  switchMap(() => this.httpClient.get(everyFiveSecond, { responseType: 'text' })),
                  takeUntil(this.destroy$)
                )
                .subscribe()
            )
          ),
          tap(() => {
            this.player = new streamaxPlayer.default(this.videoElement.nativeElement, {
              playType: 2
            });
            this.player.play({ url: result, isStream: true });
          }),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );
  }

  handlePauseClick() {
    this.player?.pause();
  }

  handleResumeClick() {
    this.player?.resume();
  }

  handleStopClick(): void {
    this.destroy();
  }

  private destroy() {
    this.player?.destroy();
    this.player = undefined;
    this.sub?.unsubscribe();
  }
}
