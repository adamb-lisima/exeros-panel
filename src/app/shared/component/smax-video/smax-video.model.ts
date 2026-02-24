export interface VideoSource {
  provider: string;
  channel: number;
  stream: string;
  sn?: number;
  has_playback_fixed: boolean;
  provider_details?: any;
}

export interface VideoPlayerState {
  element: HTMLVideoElement;
  firstCanPlay: boolean;
  canPlay: boolean;
  paused: boolean;
  currentTime: number;
  duration: number;
  ignoreEventCounter: number;
  rate: number;
  lastTimeout: number;
}

export const VIDEO_H265_STATUS = {
  PLAY: 1,
  PAUSE: 2
};
