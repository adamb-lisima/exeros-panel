import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import RouteConst from 'src/app/const/route';
import { StreamService } from '../../screen/stream/stream.service';
import { AppState } from '../../store/app-store.model';
import { AuthActions } from '../../store/auth/auth.actions';
import { iframeSetInit } from '../../store/iframe/iframe.actions';
import { IframeInput } from '../../store/iframe/iframe.model';

@Injectable({ providedIn: 'root' })
export class IframeService implements OnDestroy {
  private subscriptions = new Subscription();
  constructor(private readonly streamService: StreamService, private readonly store: Store<AppState>, private readonly router: Router) {}

  get isIframe(): boolean {
    return window !== window.parent;
  }

  process(input: IframeInput): void {
    this.store.dispatch(AuthActions.setAccessToken({ accessToken: input.token }));

    if (input.vehicle_registration_plate) {
      const subscription = this.streamService
        .fetchVehicles({
          search: input.vehicle_registration_plate,
          fleet_id: 1,
          driver_id: undefined,
          vehicle_id: undefined,
          order: 'a-z',
          with_driver: false
        })
        .subscribe({
          next: response => {
            if (response.data && response.data.length > 0) {
              input.vehicle_id = response.data[0].id;
            }
            this.finalizeProcess(input);
          },
          error: (error: unknown) => {
            this.finalizeProcess(input);
          }
        });

      this.subscriptions.add(subscription);
    } else {
      this.finalizeProcess(input);
    }
  }

  private finalizeProcess(input: IframeInput): void {
    this.store.dispatch(iframeSetInit({ input: input }));

    switch (input.module) {
      case 'livestream':
        if (input.full_app_mode) {
          this.router.navigate(['/', RouteConst.stream]);
          break;
        }
        this.router.navigate(['/', RouteConst.iframeApiLiveStream]);
        break;
      case 'playback':
        if (input.full_app_mode) {
          this.router.navigate(['/', RouteConst.stream]);
          break;
        }
        this.router.navigate(['/', RouteConst.iframeApiPlayback]);
        break;
      case 'events':
        if (input.full_app_mode) {
          this.router.navigate(['/', RouteConst.events]);
          break;
        }
        this.router.navigate(['/', RouteConst.iframeApiEvents]);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
