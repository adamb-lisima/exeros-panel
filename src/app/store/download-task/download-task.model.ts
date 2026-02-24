import { HttpResponse } from 'src/app/service/http/http.model';

interface VehicleData {
  id: number;
  registration_plate: string;
}

export interface DownloadTaskListParams {
  fleet_ids?: string;
}

export interface DownloadTaskListData {
  id: number;
  name: string;
  percent: number;
  state: string;
  date: string;
  vehicle: VehicleData;
  user_name: string;
  time: string;
  duration: number;
  created_at: string;
}

export type DownloadTaskListResponse = HttpResponse<DownloadTaskListData[]>;

export interface DownloadTaskFileMetadata {
  file_id?: string;
  url?: string;
  video_id?: string;
  dir?: string;
  original_name?: string;
  channel_name?: string;
  status?: string;
  error_code?: string;
  error_message?: string;
}

export interface DownloadTaskFilesData {
  name: string;
  identifier: string;
  size: number | null;
  channel: number | null;
  type: string;
  start_time: string | null;
  end_time: string | null;
  metadata: DownloadTaskFileMetadata;
  dir?: string;
}

export interface DownloadTaskFilesDataWrapper {
  files: DownloadTaskFilesData[];
}

export type DownloadTaskFilesResponse = HttpResponse<DownloadTaskFilesDataWrapper>;

export interface DownloadTaskDownloadFileParams {
  identifier?: string;
  filename?: string;
  name?: string;
  dir?: string;
}

export interface DownloadTaskCreateBody {
  name: string;
  from: string;
  to: string;
  channels: number[];
  stream: 'sub_stream' | 'main_stream';
}

export interface SharedClipCreateBody extends DownloadTaskCreateBody {
  is_password_required: string;
  is_send_emails: string;
  emails?: string;
  password?: string;
  expires_after_days: number;
}

export interface SharedClipResponse {
  slug: string;
  url: string;
  name: string;
  vehicle_id: number;
  registration_plate: string;
  is_send_email: string;
  emails?: string;
  user_id: number;
  user_name: string;
}

export interface ExtendEvent {
  name: string;
  from: string;
  to: string;
}

export interface ClipToEvent {
  name: string;
  from: string;
  to: string;
  channels: number[];
  stream: 'sub_stream' | 'main_stream';
}
