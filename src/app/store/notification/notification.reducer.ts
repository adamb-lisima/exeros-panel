import { createReducer, on } from '@ngrx/store';
import { notificationFetchListSuccess, notificationReset } from 'src/app/store/notification/notification.actions';
import { NotificationListData, NotificationListMeta } from 'src/app/store/notification/notification.model';
import { addNotification } from './notification.actions';

export const NOTIFICATION_FEATURE_KEY = 'notification';

export interface NotificationState {
  listData: NotificationListData[];
  listMeta: NotificationListMeta | undefined;
  listLoading: boolean;
}

export const notificationInitialState: NotificationState = {
  listData: [],
  listMeta: undefined,
  listLoading: false
};

export const notificationReducer = createReducer(
  notificationInitialState,
  on(notificationFetchListSuccess, (state, props): NotificationState => ({ ...state, listData: props.data, listMeta: props.meta })),
  on(notificationReset, (): NotificationState => ({ ...notificationInitialState })),
  on(addNotification, (state, { notification }) => ({ ...state, listData: [notification, ...state.listData] }))
);
