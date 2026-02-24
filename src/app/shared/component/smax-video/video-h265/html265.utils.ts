import { HttpClient } from '@angular/common/http';
import { DateTime } from 'luxon';
import { Observable } from 'rxjs';
import PlayerUtils from 'src/app/shared/component/smax-video/player.utils';
import HtmlElementUtil from 'src/app/util/html-element';
import { VIDEO_H265_STATUS } from '../smax-video.model';

type PlayerConfig = {
  playType: number;
  onFirstFrameRender: () => void;
  onError: (error: any) => void;
};

type PlayOptions = {
  url: string;
  isStream: boolean;
};

interface Data {
  source: string;
  channel: number;
  sn?: number;
  has_playback_fixed: boolean;
}

export default class Html265Utils extends PlayerUtils<streamaxPlayer.default, Data> {
  private readonly doubleClickListener = (event: Event) => HtmlElementUtil.fullscreen(event.target as HTMLElement);
  private interval?: NodeJS.Timer;
  private lastTimeout = 0;

  static preInitOldWay(httpClient: HttpClient, initialRequest: string, channels: number[], sn: number): Observable<any> {
    const url = `${initialRequest}&sn=${sn}&chl=${channels.join(',')}&guid=${DateTime.now().setZone('Europe/London').valueOf()}`;
    return httpClient.get(url);
  }

  play(): void {
    if (this.player) {
      this.player.resume();
    }
  }

  pause(): void {
    this.lastTimeout = 0;
    if (this.player) {
      this.player.pause();
    }
  }

  resetTimeout(): void {
    this.lastTimeout = 0;
  }

  duration(): number | undefined {
    return this.player?.getPlayedDuration();
  }

  playerState(): number {
    return this.player?.decoder.playerState ?? -1;
  }

  noNextFrames(): boolean {
    const frameBuffer = this.player?.decoder.frameBuffer;
    return !frameBuffer || frameBuffer.length === 0;
  }

  isPaused(): boolean {
    const stateIsPaused = this.playerState() === VIDEO_H265_STATUS.PAUSE;
    return stateIsPaused || this.noNextFrames();
  }

  override destroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }

    const canvas = this.queryCanvas();
    if (canvas) {
      canvas.removeEventListener('dblclick', this.doubleClickListener);
    }

    super.destroy();

    if (this.player) {
      this.player.destroy();
      this.player = undefined;
    }
  }

  protected init(hasPlaybackFixed?: boolean): void {
    setTimeout(() => {
      this.initializePlayer();
      if (hasPlaybackFixed) {
        this.startPlayback();
      } else {
        this.startPlaybackOldWay();
      }
      this.setupStatusInterval();
      this.setupEventListeners();
    });
  }

  onError: (errorCode: number, errorMessage: string) => void = () => {};

  private initializePlayer(): void {
    const config: PlayerConfig = {
      playType: 2,
      onFirstFrameRender: () => this.firstPlaying.next(true),
      onError: error => {
        if (typeof error === 'object' && error.e && error.m) {
          this.onError(error.e, error.m);
        } else if (typeof error === 'string') {
          this.onError(-1, error);
        }
      }
    };

    this.player = new streamaxPlayer.default(this.element, config);
  }

  private startPlaybackOldWay(): void {
    if (!this.player) return;

    const timestamp = DateTime.now().setZone('Europe/London').valueOf();
    const options: PlayOptions = {
      url: `${this.data.source}&sn=${this.data.sn}&guid=${timestamp}`,
      isStream: true
    };

    this.player.play(options);
  }

  private startPlayback(): void {
    if (!this.player) return;

    const options: PlayOptions = {
      url: `${this.data.source}`,
      isStream: true
    };

    this.player.play(options);
  }

  private setupStatusInterval(): void {
    this.interval = setInterval(() => {
      this.lastTimeout += 0.1;

      this.state = {
        currentTime: this.player?.getPlayedDuration(),
        paused: this.isPaused(),
        lastTimeout: this.lastTimeout
      };
    }, 100);
  }

  private setupEventListeners(): void {
    const canvas = this.queryCanvas();
    if (canvas) {
      canvas.addEventListener('dblclick', this.doubleClickListener);
    }
  }

  private queryCanvas(): HTMLElement | null {
    const selector = `#video-h265-${this.data.channel} .st-player-container > canvas`;
    return document.querySelector(selector);
  }
}
