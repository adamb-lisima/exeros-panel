import { createReducer, on } from '@ngrx/store';
import { iframeReset, iframeSetInit } from './iframe.actions';

export const IFRAME_FEATURE_KEY = 'iframe';

export interface IframeState {
  init: boolean;
  vehicle_id?: number;
  stream_mode?: number;
  channels?: number[];
  audio?: boolean;
  with_timeline?: boolean;
  full_app_mode?: boolean;
  from?: string;
  to?: string;
  event_id?: string;
  module: 'livestream' | 'playback' | 'events';
}

export const iframeInitialState: IframeState = {
  init: false,
  vehicle_id: undefined,
  stream_mode: undefined,
  channels: [],
  audio: undefined,
  with_timeline: undefined,
  from: undefined,
  to: undefined,
  event_id: undefined,
  module: 'livestream'
};

export const iframeReducer = createReducer(
  iframeInitialState,
  on(iframeSetInit, (state, { input }): IframeState => ({ ...state, init: true, vehicle_id: input.vehicle_id, stream_mode: input.stream_mode, channels: input.channels, audio: input.audio, full_app_mode: input.full_app_mode, with_timeline: input.with_timeline, from: input.from, to: input.to, event_id: input.event_id, module: input.module })),
  on(iframeReset, (): IframeState => ({ ...iframeInitialState }))
);
