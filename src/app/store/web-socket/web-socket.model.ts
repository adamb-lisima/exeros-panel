export type EventName = 'sub_alarm' | 'sub_state' | 'sub_gps';

export type SharedEvent = Partial<AlarmEvent & StateEvent & GpsEvent>;

export interface AlarmEvent {
  alarmId: string;
  alarmState: number;
  altitude: number;
  carlicense: string;
  content: string;
  dateTime: string;
  deviceno: string;
  direction: number;
  groupName: string;
  lat: string;
  lng: string;
  speed: number;
  state: number;
  type: number;
}

export interface StateEvent {
  carlicense: string;
  deviceno: string;
  groupName: string;
  state: number;
  vid: number;
}

export interface GpsEvent {
  altitude: number;
  carlicense: string;
  dateTime: string;
  deviceno: string;
  direction: number;
  groupName: string;
  lat: string;
  lng: string;
  speed: number;
  state: number;
  vid: number;
}
