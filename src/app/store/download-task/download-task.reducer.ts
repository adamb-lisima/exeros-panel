import { createReducer, on } from '@ngrx/store';
import { downloadTaskFetchFilesSuccess, downloadTaskFetchListSuccess, downloadTaskFilesLoading, downloadTaskListLoading, downloadTaskReset } from 'src/app/store/download-task/download-task.actions';
import { DownloadTaskFilesData, DownloadTaskListData } from 'src/app/store/download-task/download-task.model';

export const DOWNLOAD_TASK_FEATURE_KEY = 'downloadTask';

export interface DownloadTaskState {
  listData: DownloadTaskListData[];
  listLoading: boolean;
  files: DownloadTaskFilesData[];
  filesLoading: boolean;
}

export const downloadTaskInitialState: DownloadTaskState = {
  listData: [],
  listLoading: false,
  files: [],
  filesLoading: false
};

export const downloadTaskReducer = createReducer(
  downloadTaskInitialState,
  on(downloadTaskListLoading, (state, props): DownloadTaskState => ({ ...state, listLoading: props.loading })),
  on(downloadTaskFilesLoading, (state, props): DownloadTaskState => ({ ...state, filesLoading: props.loading })),
  on(downloadTaskFetchListSuccess, (state, props): DownloadTaskState => ({ ...state, listData: props.data })),
  on(downloadTaskFetchFilesSuccess, (state, props): DownloadTaskState => ({ ...state, files: props.data })),
  on(downloadTaskReset, (): DownloadTaskState => ({ ...downloadTaskInitialState }))
);
