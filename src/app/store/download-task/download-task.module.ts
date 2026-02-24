import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { DownloadTaskEffects } from 'src/app/store/download-task/download-task.effects';
import { DOWNLOAD_TASK_FEATURE_KEY, downloadTaskReducer } from 'src/app/store/download-task/download-task.reducer';

@NgModule({
  imports: [StoreModule.forFeature(DOWNLOAD_TASK_FEATURE_KEY, downloadTaskReducer), EffectsModule.forFeature([DownloadTaskEffects])]
})
export class DownloadTaskModule {}
