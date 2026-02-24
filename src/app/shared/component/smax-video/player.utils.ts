import { BehaviorSubject } from 'rxjs';
import { VideoPlayerState } from 'src/app/shared/component/smax-video/smax-video.model';

const DEFAULT_STATE: Omit<VideoPlayerState, 'element'> = {
  firstCanPlay: false,
  canPlay: false,
  paused: false,
  currentTime: 0,
  duration: 0,
  ignoreEventCounter: 0,
  rate: 1,
  lastTimeout: 0
};

export default abstract class PlayerUtils<Player extends streamaxPlayer.default, Data extends object> {
  firstPlaying = new BehaviorSubject<boolean>(false);
  protected player?: Player;

  protected _state: VideoPlayerState;

  protected abstract init(hasPlaybackFixed?: boolean): void;

  abstract play(): void;

  abstract pause(): void;

  constructor(protected element: HTMLVideoElement, protected data: Data, protected callback?: { onStateChange?: (state: VideoPlayerState) => void }) {
    this._state = { element, ...DEFAULT_STATE };
    const hasPlaybackFixed = 'has_playback_fixed' in data ? ((data as any).has_playback_fixed as boolean | undefined) : undefined;
    this.init(hasPlaybackFixed);
  }

  protected set state(v: Partial<VideoPlayerState>) {
    this._state = { ...this._state, ...v };
    this.callback?.onStateChange?.(this._state);
  }

  destroy() {
    this.state = { ...DEFAULT_STATE };
    this.pause();
  }
}
