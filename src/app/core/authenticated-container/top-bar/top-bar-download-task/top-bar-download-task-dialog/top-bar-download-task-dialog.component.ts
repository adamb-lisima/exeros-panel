import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { first, map, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { TopBarDownloadTaskDialogData } from 'src/app/core/authenticated-container/top-bar/top-bar-download-task/top-bar-download-task-dialog/top-bar-download-task-dialog.model';
import { ConfirmationDialogComponent } from 'src/app/shared/component/dialog/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialogData, ConfirmationDialogReturn } from 'src/app/shared/component/dialog/confirmation-dialog/confirmation-dialog.model';
import { AppState } from 'src/app/store/app-store.model';
import { downloadTaskDelete, downloadTaskDeleteSuccess, downloadTaskDownloadFile, downloadTaskDownloadFileSuccess, downloadTaskFetchListSuccess } from 'src/app/store/download-task/download-task.actions';
import { DownloadTaskDownloadFileParams, DownloadTaskFilesData } from 'src/app/store/download-task/download-task.model';
import { waitOnceForAction } from 'src/app/util/operators';

@Component({
  templateUrl: './top-bar-download-task-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarDownloadTaskDialogComponent implements OnDestroy {
  downloadTaskFilesData$ = this.store.select(state => state.downloadTask.files);
  downloadTaskFilesLoading$ = this.store.select(state => state.downloadTask.filesLoading);
  hasCameraData$ = this.downloadTaskFilesData$.pipe(map(files => files?.some(file => file.channel != null || file.metadata?.channel_name) ?? false));
  private readonly destroy$ = new Subject<void>();

  constructor(@Inject(DIALOG_DATA) public data: TopBarDownloadTaskDialogData, private readonly dialogRef: DialogRef, private readonly dialog: Dialog, private readonly store: Store<AppState>, private readonly actions$: Actions) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleDeleteDownloadTaskClick(): void {
    const dialogRef = this.dialog.open<ConfirmationDialogReturn, ConfirmationDialogData>(ConfirmationDialogComponent, {
      data: { header: `Do you want to remove "${this.data.downloadTask.name}" task?` },
      autoFocus: 'dialog'
    });
    dialogRef.closed
      .pipe(
        first(data => !!data?.confirmed),
        tap(() => this.store.dispatch(downloadTaskDelete({ id: this.data.downloadTask.id }))),
        switchMap(() => this.actions$),
        waitOnceForAction([downloadTaskDeleteSuccess, downloadTaskFetchListSuccess]),
        tap(() => this.dialogRef.close()),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  handleFileClick(file: DownloadTaskFilesData): void {
    const isDirectUrl = file.identifier && (file.identifier.startsWith('http://') || file.identifier.startsWith('https://'));

    if (isDirectUrl) {
      this.downloadFileDirectly(file.identifier, file.name);
    } else {
      this.downloadViaBackend(file);
    }
  }

  private downloadFileDirectly(url: string, filename: string): void {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        this.dialogRef.close();
      })
      .catch(() => {
        this.downloadViaBackend({
          name: filename,
          identifier: url,
          size: null,
          channel: null,
          type: 'VIDEO',
          start_time: null,
          end_time: null,
          metadata: {}
        });
      });
  }

  private downloadViaBackend(file: DownloadTaskFilesData): void {
    const params: DownloadTaskDownloadFileParams = {};

    if (file.identifier) {
      params.identifier = file.identifier;
    }

    if (file.name) {
      params.name = file.name;
      params.filename = file.name;
    }

    if (file.metadata?.dir) {
      params.dir = file.metadata.dir;
    } else if (file.dir) {
      params.dir = file.dir;
    }

    if (file.metadata?.original_name) {
      params.filename = file.metadata.original_name;
    }

    this.store.dispatch(
      downloadTaskDownloadFile({
        id: this.data.downloadTask.id,
        params
      })
    );
    this.actions$
      .pipe(
        waitOnceForAction([downloadTaskDownloadFileSuccess]),
        tap(() => this.dialogRef.close()),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }
}
