export interface IframeInput {
  token: string;
  module: 'livestream' | 'playback' | 'events';
  vehicle_id?: number;
  vehicle_registration_plate?: string;
  stream_mode?: number;
  channels?: number[];
  audio?: boolean;
  with_timeline?: boolean;
  full_app_mode?: boolean;
  from?: string;
  to?: string;
  event_id?: string;
}
