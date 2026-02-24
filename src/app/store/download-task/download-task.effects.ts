import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concat, concatMap, EMPTY, map, of, switchMap } from 'rxjs';
import { applicationLoading } from 'src/app/store/application/application.actions';
import { downloadTaskCreate, downloadTaskCreateSuccess, downloadTaskDelete, downloadTaskDeleteSuccess, downloadTaskDownloadFile, downloadTaskDownloadFileSuccess, downloadTaskFetchFiles, downloadTaskFetchFilesSuccess, downloadTaskFetchList, downloadTaskFetchListSuccess, downloadTaskFilesLoading, downloadTaskListLoading } from 'src/app/store/download-task/download-task.actions';
import { DownloadTaskService } from 'src/app/store/download-task/download-task.service';

@Injectable()
export class DownloadTaskEffects {
  fetchList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(downloadTaskFetchList),
      switchMap(() =>
        concat(
          of(downloadTaskListLoading({ loading: true })),
          this.downloadTaskService.fetchDownloadTasks({}).pipe(
            map(({ data }) => downloadTaskFetchListSuccess({ data })),
            catchError(() => EMPTY)
          ),
          of(downloadTaskListLoading({ loading: false }))
        )
      )
    )
  );

  downloadTaskDelete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(downloadTaskDelete),
      switchMap(({ id }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'downloadTaskDelete$' })),
          this.downloadTaskService.deleteDownloadTask(id).pipe(
            map(() => downloadTaskDeleteSuccess()),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'downloadTaskDelete$' }))
        )
      )
    )
  );

  downloadTaskFetchFiles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(downloadTaskFetchFiles),
      switchMap(({ id }) =>
        concat(
          of(downloadTaskFilesLoading({ loading: true })),
          this.downloadTaskService.fetchFiles(id).pipe(
            map(({ data }) => downloadTaskFetchFilesSuccess({ data: data.files })),
            catchError(() => EMPTY)
          ),
          of(downloadTaskFilesLoading({ loading: false }))
        )
      )
    )
  );

  downloadTaskDownloadFile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(downloadTaskDownloadFile),
      switchMap(({ id, params }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'downloadTaskDownloadFile$' })),
          this.downloadTaskService.downloadFile(id, params).pipe(
            map(() => downloadTaskDownloadFileSuccess()),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'downloadTaskDownloadFile$' }))
        )
      )
    )
  );

  downloadTaskCreate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(downloadTaskCreate),
      switchMap(({ id, body }) =>
        concat(
          of(applicationLoading({ loading: true, key: 'downloadTaskCreate$' })),
          this.downloadTaskService.createDownloadTask(id, body).pipe(
            switchMap(() => this.downloadTaskService.fetchDownloadTasks({})),
            concatMap(({ data }) => [downloadTaskCreateSuccess(), downloadTaskFetchListSuccess({ data })]),
            catchError(() => EMPTY)
          ),
          of(applicationLoading({ loading: false, key: 'downloadTaskCreate$' }))
        )
      )
    )
  );

  constructor(private readonly actions$: Actions, private readonly downloadTaskService: DownloadTaskService) {}
}
