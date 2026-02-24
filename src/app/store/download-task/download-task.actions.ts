import { createAction, props } from '@ngrx/store';
import { DownloadTaskCreateBody, DownloadTaskDownloadFileParams, DownloadTaskFilesData, DownloadTaskListData } from 'src/app/store/download-task/download-task.model';

export const downloadTaskListLoading = createAction('[DownloadTask] ListLoading', props<{ loading: boolean }>());
export const downloadTaskFilesLoading = createAction('[DownloadTask] FilesLoading', props<{ loading: boolean }>());

export const downloadTaskFetchList = createAction('[DownloadTask] FetchList');
export const downloadTaskFetchListSuccess = createAction('[DownloadTask] FetchList Success', props<{ data: DownloadTaskListData[] }>());

export const downloadTaskDelete = createAction('[DownloadTask] Delete', props<{ id: number }>());
export const downloadTaskDeleteSuccess = createAction('[DownloadTask] Delete Success');

export const downloadTaskFetchFiles = createAction('[DownloadTask] FetchFiles', props<{ id: number }>());
export const downloadTaskFetchFilesSuccess = createAction('[DownloadTask] FetchFiles Success', props<{ data: DownloadTaskFilesData[] }>());

export const downloadTaskDownloadFile = createAction('[DownloadTask] DownloadFile', props<{ id: number; params: DownloadTaskDownloadFileParams }>());
export const downloadTaskDownloadFileSuccess = createAction('[DownloadTask] DownloadFile Success');

export const downloadTaskCreate = createAction('[DownloadTask] Create', props<{ id: number; body: DownloadTaskCreateBody }>());
export const downloadTaskCreateSuccess = createAction('[DownloadTask] Create Success');

export const downloadTaskReset = createAction('[DownloadTask] Reset');
