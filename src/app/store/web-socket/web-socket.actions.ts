import { createAction, props } from '@ngrx/store';
import { AlarmEvent, GpsEvent, StateEvent } from 'src/app/store/web-socket/web-socket.model';

export const webSocketSetAlarm = createAction('[WebSocket] SetAlarm', props<{ alarm: AlarmEvent }>());
export const webSocketSetState = createAction('[WebSocket] SetState', props<{ state: StateEvent }>());
export const webSocketSetGps = createAction('[WebSocket] SetGps', props<{ gps: GpsEvent }>());
export const webSocketReset = createAction('[WebSocket] Reset');
