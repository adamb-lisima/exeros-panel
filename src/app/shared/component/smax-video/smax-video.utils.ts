import { DateTime } from 'luxon';
import { VideoPlayerState } from 'src/app/shared/component/smax-video/smax-video.model';

type States = { [key: number]: VideoPlayerState };
type SameTimeOccurrences = { [key: number]: DateTime };

export default class SmaxVideoUtils {
  private _prev_states: States = {};
  private _states: States = {};
  private lastEmittedCurrentTime?: number;
  private syncInit = false;
  private sameTimeOccurrence: SameTimeOccurrences = {};

  get states(): States {
    return this._states;
  }

  update(incomingStates: States): void {
    this._prev_states = { ...this._states };
    this._states = { ...this._states, ...incomingStates };
  }

  async sync(index: number): Promise<void> {
    const statesValues = Object.entries(this._states)
      .filter(([key]) => key != index.toString())
      .map(([, value]) => value);

    if (statesValues.length === 0) {
      return;
    }

    const state = this._states[index];

    if (state.ignoreEventCounter > 0) {
      state.ignoreEventCounter--;
      return;
    }

    if (!this.syncInit) {
      this.syncInit = true;
      const values = Object.values(this._states);
      for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (value.paused) {
          await value.element.play();
        }
      }
      return;
    }

    if (state.paused) {
      for (let i = 0; i < statesValues.length; i++) {
        const value = statesValues[i];
        if (!value.paused) {
          value.ignoreEventCounter++;
          value.element.pause();
        }
      }
    } else {
      for (let i = 0; i < statesValues.length; i++) {
        const value = statesValues[i];
        if (value.paused) {
          value.ignoreEventCounter++;
          await value.element.play();
        }
      }
    }

    const isEnded = state.currentTime >= state.duration;
    for (let i = 0; i < statesValues.length; i++) {
      const value = statesValues[i];

      const currentTime = isEnded ? value.element.duration : state.element.currentTime;
      if (value.element.currentTime !== currentTime && !Number.isNaN(currentTime)) {
        value.element.currentTime = currentTime;
        value.currentTime = currentTime;
        value.ignoreEventCounter++;
      }

      const rate = state.element.playbackRate;
      if (value.element.playbackRate !== rate) {
        value.element.playbackRate = rate;
        value.rate = rate;
        value.ignoreEventCounter++;
      }
    }
  }

  timeout(timeout: number | null | undefined, onTimeout: () => void): void {
    const maxTime = Math.max(...Object.values(this._states).map(value => value.lastTimeout));
    if (maxTime >= this.calculateTimeout(timeout)) {
      onTimeout();
      this.reset();
    }
  }

  calculateTimeout(videoTimeout: number | null | undefined): number {
    if (videoTimeout !== undefined && videoTimeout !== null) {
      return videoTimeout > 0 ? videoTimeout : 9999999999;
    } else {
      return 60;
    }
  }

  emitOffset(onTimeChange: (value: number) => void): void {
    const maxTime = Math.max(...Object.values(this._states).map(value => value.currentTime));
    if (maxTime !== this.lastEmittedCurrentTime) {
      this.lastEmittedCurrentTime = maxTime;
      onTimeChange(maxTime);
    }
  }

  stuckCheck(index: number, onStuck: () => void): void {
    if (this._states[index]?.currentTime !== this._prev_states[index]?.currentTime) {
      this.sameTimeOccurrence[index] = DateTime.now().setZone('Europe/London');
    }
    if (Object.entries(this.sameTimeOccurrence).some(([, value]) => DateTime.now().setZone('Europe/London').minus({ second: 30 }) > value)) {
      this.sameTimeOccurrence = {};
      onStuck();
    }
  }

  reset(): void {
    this._prev_states = {};
    this._states = {};
    this.lastEmittedCurrentTime = undefined;
    this.syncInit = false;
    this.sameTimeOccurrence = {};
  }
}
