import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, concat, EMPTY, map, of, switchMap, withLatestFrom } from 'rxjs';
import { AppState } from 'src/app/store/app-store.model';
import { notificationFetchListFirstPage, notificationFetchListNextPage, notificationFetchListSuccess, notificationLoading } from 'src/app/store/notification/notification.actions';
import { NotificationService } from 'src/app/store/notification/notification.service';

@Injectable()
export class NotificationEffects {
  fetchFirstPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(notificationFetchListFirstPage),
      switchMap(({ params }) =>
        concat(
          of(notificationLoading({ loading: true })),
          this.notificationService.fetchNotifications({ ...params, page: 1 }).pipe(
            map(({ data, meta }) => notificationFetchListSuccess({ data, meta })),
            catchError(() => EMPTY)
          ),
          of(notificationLoading({ loading: false }))
        )
      )
    )
  );

  fetchNextPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(notificationFetchListNextPage),
      withLatestFrom(this.store.select(state => state.notification)),
      switchMap(([{ params }, { listData }]) =>
        concat(
          of(notificationLoading({ loading: true })),
          this.notificationService.fetchNotifications(params).pipe(
            map(({ data, meta }) => notificationFetchListSuccess({ data: [...listData, ...data], meta })),
            catchError(() => EMPTY)
          ),
          of(notificationLoading({ loading: false }))
        )
      )
    )
  );

  constructor(private readonly store: Store<AppState>, private readonly actions$: Actions, private readonly notificationService: NotificationService) {}
}
