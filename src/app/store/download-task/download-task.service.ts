import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from 'src/app/service/http/http.service';
import { DownloadTaskCreateBody, DownloadTaskDownloadFileParams, DownloadTaskFilesResponse, DownloadTaskListParams, DownloadTaskListResponse } from 'src/app/store/download-task/download-task.model';

@Injectable({ providedIn: 'root' })
export class DownloadTaskService {
  constructor(private readonly http: HttpService) {}

  fetchDownloadTasks(params: DownloadTaskListParams): Observable<DownloadTaskListResponse> {
    return this.http.get$<DownloadTaskListResponse>('vehicles/playbacks/tasks', params);
  }

  deleteDownloadTask(id: number): Observable<any> {
    return this.http.delete$<any>(`vehicles/playbacks/${id}/delete-download-task`);
  }

  fetchFiles(id: number): Observable<DownloadTaskFilesResponse> {
    return this.http.get$<DownloadTaskFilesResponse>(`vehicles/playbacks/${id}/download-list`);
  }

  downloadFile(id: number, params: DownloadTaskDownloadFileParams): Observable<any> {
    return this.http.getFile$(`vehicles/playbacks/${id}/download`, params);
  }

  createDownloadTask(id: number, body: DownloadTaskCreateBody): Observable<any> {
    return this.http.post$(`vehicles/playbacks/${id}/add-download-task`, {
      ...body,
      stream: body.stream === 'sub_stream' ? 0 : 1
    });
  }
}
