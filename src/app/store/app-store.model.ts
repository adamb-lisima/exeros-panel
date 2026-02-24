import { APPLICATION_FEATURE_KEY, ApplicationState } from 'src/app/store/application/application.reducer';
import { AUTH_FEATURE_KEY, AuthState } from 'src/app/store/auth/auth.reducer';
import { CONFIG_FEATURE_KEY, ConfigState } from 'src/app/store/config/config.reducer';
import { DOWNLOAD_TASK_FEATURE_KEY, DownloadTaskState } from 'src/app/store/download-task/download-task.reducer';
import { IFRAME_FEATURE_KEY, IframeState } from 'src/app/store/iframe/iframe.reducer';
import { NOTIFICATION_FEATURE_KEY, NotificationState } from 'src/app/store/notification/notification.reducer';
import { WEB_SOCKET_FEATURE_KEY, WebSocketState } from 'src/app/store/web-socket/web-socket.reducer';

export interface AppState {
  [APPLICATION_FEATURE_KEY]: ApplicationState;
  [AUTH_FEATURE_KEY]: AuthState;
  [CONFIG_FEATURE_KEY]: ConfigState;
  [DOWNLOAD_TASK_FEATURE_KEY]: DownloadTaskState;
  [IFRAME_FEATURE_KEY]: IframeState;
  [NOTIFICATION_FEATURE_KEY]: NotificationState;
  [WEB_SOCKET_FEATURE_KEY]: WebSocketState;
}
