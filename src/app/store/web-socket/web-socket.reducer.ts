import { createReducer, on } from '@ngrx/store';
import { webSocketReset, webSocketSetAlarm, webSocketSetGps, webSocketSetState } from 'src/app/store/web-socket/web-socket.actions';
import { AlarmEvent, GpsEvent, SharedEvent, StateEvent } from 'src/app/store/web-socket/web-socket.model';

export const WEB_SOCKET_FEATURE_KEY = 'webSocket';

export interface WebSocketState {
  shared: SharedEvent;
  alarms: AlarmEvent[];
  alarm: AlarmEvent | undefined;
  state: StateEvent | undefined;
  gps: GpsEvent | undefined;
}

export const webSocketInitialState: WebSocketState = {
  shared: {},
  alarms: [],
  alarm: undefined,
  state: undefined,
  gps: undefined
};

export const webSocketReducer = createReducer(
  webSocketInitialState,
  on(webSocketSetAlarm, (state, props): WebSocketState => ({ ...state, alarm: props.alarm, alarms: [props.alarm, ...state.alarms], shared: { ...state.shared, ...props.alarm } })),
  on(webSocketSetState, (state, props): WebSocketState => ({ ...state, state: props.state, shared: { ...state.shared, ...props.state } })),
  on(webSocketSetGps, (state, props): WebSocketState => ({ ...state, gps: props.gps, shared: { ...state.shared, ...props.gps } })),
  on(webSocketReset, (): WebSocketState => ({ ...webSocketInitialState }))
);
