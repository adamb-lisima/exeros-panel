import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from 'src/app/service/http/http.service';
import { NotificationListParams, NotificationListResponse } from 'src/app/store/notification/notification.model';

export const DEFAULT_PER_PAGE: NotificationListParams['per_page'] = 10;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private readonly http: HttpService) {}

  fetchNotifications(params: Omit<NotificationListParams, 'per_page'>): Observable<NotificationListResponse> {
    return this.http.get$<NotificationListResponse>('notifications', { ...params, per_page: DEFAULT_PER_PAGE });
  }
}
