import { PageMeta } from 'src/app/model/page.model';
import { HttpResponse } from 'src/app/service/http/http.model';

export interface NotificationListParams {
  page: number;
  per_page: number;
}

export interface NotificationListData {
  _id: string;
  type: string;
  message: string;
  created_at: string;
  route_type?: 'live-feeds' | 'playbacks' | 'events' | 'vehicles';
  route_param?: string;
}

export interface NotificationListMeta extends PageMeta {}

export type NotificationListResponse = HttpResponse<NotificationListData[], NotificationListMeta>;
