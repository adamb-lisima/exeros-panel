import { createAction, props } from '@ngrx/store';
import { NotificationListData, NotificationListMeta, NotificationListParams } from 'src/app/store/notification/notification.model';

export const notificationLoading = createAction('[Notification] Loading', props<{ loading: boolean }>());

export const notificationFetchListFirstPage = createAction('[Notification] FetchListFirstPage', props<{ params: Omit<NotificationListParams, 'page' | 'per_page'> }>());
export const notificationFetchListNextPage = createAction('[Notification] FetchListNextPage', props<{ params: Omit<NotificationListParams, 'per_page'> }>());
export const notificationFetchListSuccess = createAction('[Notification] FetchListSuccess Success', props<{ data: NotificationListData[]; meta: NotificationListMeta }>());

export const notificationReset = createAction('[Notification] Reset');

export const addNotification = createAction('[Notification] Add Notification', props<{ notification: NotificationListData }>());
