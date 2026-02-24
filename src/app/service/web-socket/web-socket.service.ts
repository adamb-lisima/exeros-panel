import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Socket } from 'ngx-socket-io';
import { Subscription, tap } from 'rxjs';
import { webSocketReset, webSocketSetAlarm, webSocketSetGps, webSocketSetState } from 'src/app/store/web-socket/web-socket.actions';
import { AlarmEvent, EventName, GpsEvent, StateEvent } from 'src/app/store/web-socket/web-socket.model';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket?: Socket;
  private key?: string;
  private subscription?: Subscription;

  constructor(private readonly store: Store) {}

  set data(v: { url: string; key: string }) {
    this.socket = new Socket({ url: v.url, options: { transports: ['polling'], timeout: 60000, autoConnect: false } });
    this.key = v.key;
  }

  connect(deviceIds: string[], eventNames: EventName[]): void {
    this.disconnect();
    this.socket?.connect();
    this.subscription = new Subscription();

    if (eventNames.includes('sub_alarm')) {
      this.subscription.add(
        this.socket
          ?.fromEvent<AlarmEvent>('sub_alarm')
          .pipe(tap(event => this.store.dispatch(webSocketSetAlarm({ alarm: event }))))
          .subscribe()
      );
    }
    if (eventNames.includes('sub_state')) {
      this.subscription.add(
        this.socket
          ?.fromEvent<StateEvent>('sub_state')
          .pipe(tap(event => this.store.dispatch(webSocketSetState({ state: event }))))
          .subscribe()
      );
    }
    if (eventNames.includes('sub_gps')) {
      this.subscription.add(
        this.socket
          ?.fromEvent<GpsEvent>('sub_gps')
          .pipe(tap(event => this.store.dispatch(webSocketSetGps({ gps: event }))))
          .subscribe()
      );
    }
    eventNames.forEach(name => this.socket?.emit(name, { key: this.key, didArray: deviceIds }));
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket?.removeAllListeners();
    this.subscription?.unsubscribe();
    this.store.dispatch(webSocketReset());
  }
}
