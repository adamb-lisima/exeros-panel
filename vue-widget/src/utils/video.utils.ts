import { DateTime } from 'luxon';

type States = { [key: number]: VideoPlayerState };
type SameTimeOccurrences = { [key: number]: DateTime };

export interface VideoPlayerState {
  element: HTMLVideoElement;
  currentTime: number;
  duration: number;
  paused: boolean;
  rate: number;
  ignoreEventCounter: number;
  lastTimeout: number;
}

export default class VideoUtils {
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
    const statesValues = this.getOtherStates(index);
    if (statesValues.length === 0) return;

    const state = this._states[index];
    if (this.shouldSkipSync(state)) return;

    if (!this.syncInit) {
      return await this.initializeSync();
    }

    await this.syncPlaybackState(state, statesValues);
    this.syncTimeAndRate(state, statesValues);
  }

  private getOtherStates(index: number): VideoPlayerState[] {
    return Object.entries(this._states)
      .filter(([key]) => key != index.toString())
      .map(([, value]) => value);
  }

  private shouldSkipSync(state: VideoPlayerState): boolean {
    if (state.ignoreEventCounter > 0) {
      state.ignoreEventCounter--;
      return true;
    }
    return false;
  }

  private async initializeSync(): Promise<void> {
    this.syncInit = true;
    const values = Object.values(this._states);
    for (const value of values) {
      if (value.paused) {
        await value.element.play();
      }
    }
  }

  private async syncPlaybackState(state: VideoPlayerState, statesValues: VideoPlayerState[]): Promise<void> {
    if (state.paused) {
      await this.pauseOtherPlayers(statesValues);
    } else {
      await this.playOtherPlayers(statesValues);
    }
  }

  private async pauseOtherPlayers(statesValues: VideoPlayerState[]): Promise<void> {
    for (const value of statesValues) {
      if (!value.paused) {
        value.ignoreEventCounter++;
        value.element.pause();
      }
    }
  }

  private async playOtherPlayers(statesValues: VideoPlayerState[]): Promise<void> {
    for (const value of statesValues) {
      if (value.paused) {
        value.ignoreEventCounter++;
        await value.element.play();
      }
    }
  }

  private syncTimeAndRate(state: VideoPlayerState, statesValues: VideoPlayerState[]): void {
    const isEnded = state.currentTime >= state.duration;

    for (const value of statesValues) {
      this.syncTime(state, value, isEnded);
      this.syncRate(state, value);
    }
  }

  private syncTime(state: VideoPlayerState, target: VideoPlayerState, isEnded: boolean): void {
    const currentTime = isEnded ? target.element.duration : state.element.currentTime;

    if (target.element.currentTime !== currentTime && !Number.isNaN(currentTime)) {
      target.element.currentTime = currentTime;
      target.currentTime = currentTime;
      target.ignoreEventCounter++;
    }
  }

  private syncRate(state: VideoPlayerState, target: VideoPlayerState): void {
    const rate = state.element.playbackRate;

    if (target.element.playbackRate !== rate) {
      target.element.playbackRate = rate;
      target.rate = rate;
      target.ignoreEventCounter++;
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
