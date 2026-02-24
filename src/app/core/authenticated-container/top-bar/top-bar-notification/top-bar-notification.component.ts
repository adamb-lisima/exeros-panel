import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import Pusher from 'pusher-js';
import { filter, first, interval, map, Observable, Subject, Subscription, takeUntil, tap } from 'rxjs';
import { AppState } from 'src/app/store/app-store.model';
import { addNotification, notificationFetchListFirstPage, notificationFetchListNextPage, notificationReset } from 'src/app/store/notification/notification.actions';
import { NotificationListData, NotificationListParams } from 'src/app/store/notification/notification.model';
import { environment } from 'src/environments/environment';
import RouteConst from '../../../../const/route';
import { UserData } from '../../../../store/auth/auth.model';
import { AuthSelectors } from '../../../../store/auth/auth.selectors';

@Component({
  selector: 'app-top-bar-notification',
  templateUrl: './top-bar-notification.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarNotificationComponent implements OnInit, OnDestroy {
  notificationListData$ = this.store.select(state => state.notification.listData);
  notificationListMeta$ = this.store.select(state => state.notification.listMeta);
  notificationListLoading$ = this.store.select(state => state.notification.listLoading);

  private readonly subscription = new Subscription();
  private readonly destroy$ = new Subject<void>();
  private readonly audio: HTMLAudioElement;
  loggedInUser$: Observable<UserData | undefined>;
  userId: number | undefined;
  userRole: string | undefined;
  private accessToken: string | undefined;

  constructor(private readonly store: Store<AppState>, private readonly router: Router) {
    this.audio = new Audio();
    this.audio.src = 'assets/event-sound.wav';
    this.loggedInUser$ = this.store.select(AuthSelectors.loggedInUser);

    this.store
      .select(AuthSelectors.accessToken)
      .pipe(
        first(),
        map(token => (token ? token.toString() : '')),
        takeUntil(this.destroy$)
      )
      .subscribe(token => {
        this.accessToken = token;
      });
  }

  ngOnInit(): void {
    this.fetchFirstPage();
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(error => {});
      }
    }

    this.subscription.add(
      this.loggedInUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
        if (user?.id) {
          this.userId = user.id;
          if (user.role === 'SUPER_ADMIN') {
            this.userRole = 'SUPER_ADMIN';

            const intervalSubscription = interval(45000)
              .pipe(
                filter(() => !document.hidden),
                tap(() => this.fetchFirstPage()),
                takeUntil(this.destroy$)
              )
              .subscribe();

            this.subscription.add(intervalSubscription);
          }
        }
      })
    );

    const pusher = new Pusher(environment.pusherAppKey, {
      cluster: 'eu',
      authEndpoint: environment.baseUrl + '/broadcasting/auth',
      auth: {
        headers: {
          Authorization: 'Bearer ' + this.accessToken
        }
      }
    });
    const channel = pusher.subscribe(environment.pusherAppChannel + '.' + this.userId);
    channel.bind('my-event', (data: any) => {
      const newNotification = JSON.parse(JSON.stringify(data)).message;
      if (newNotification.userId === this.userId) {
        const notificationObject = {
          _id: newNotification._id,
          type: newNotification.type,
          message: newNotification.message,
          created_at: newNotification.createdAt,
          route_type: newNotification.routeType,
          route_param: newNotification.routeParam
        };
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Alarm', { body: notificationObject.message });
        }
        this.audio.play();
        if (this.userRole !== 'SUPER_ADMIN') {
          this.addNewNotification(notificationObject);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(notificationReset());
  }

  handleNotificationClick(notification: NotificationListData): void {
    if (notification.route_type === 'events') {
      const id = notification.route_param;
      this.router.navigate(['/', RouteConst.events, id]);
    }
  }

  handleNextPageRequest(page: NotificationListParams['page']): void {
    this.store.dispatch(notificationFetchListNextPage({ params: { page } }));
  }

  private fetchFirstPage(): void {
    this.store.dispatch(notificationFetchListFirstPage({ params: {} }));
  }

  addNewNotification(newNotification: NotificationListData) {
    this.store.dispatch(addNotification({ notification: newNotification }));
  }
}
