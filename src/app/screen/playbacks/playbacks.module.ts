import { CdkAccordionModule } from '@angular/cdk/accordion';
import { CdkMenuModule } from '@angular/cdk/menu';
import { NgOptimizedImage } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StarRatingModule } from '../../shared/component/star-rating/star-rating.module';
import { SharedModule } from '../../shared/shared.module';
import { VideoModule } from '../../shared/component/video/video.module';
import { StreamCorePlaybackChartsDownloadClipDialogComponent } from '../stream/stream-core/stream-core-playback-charts-download-clip-dialog/stream-core-playback-charts-download-clip-dialog.component';
import { StreamCorePlaybackChartsComponent } from '../stream/stream-core/stream-core-playback-charts/stream-core-playback-charts.component';
import { StreamCorePlaybackVideosComponent } from '../stream/stream-core/stream-core-playback-videos/stream-core-playback-videos.component';
import { StreamPlaybackMapComponent } from '../stream/stream-left/stream-playback-map/stream-playback-map.component';
import { StreamEffects } from '../stream/stream.effects';
import { STREAM_FEATURE_KEY, streamReducer } from '../stream/stream.reducer';
import { PlaybacksBottomComponent } from './playbacks-bottom/playbacks-bottom.component';
import { PlaybacksCoreComponent } from './playbacks-core/playbacks-core.component';
import { PlaybacksTelemetryComponent } from './playbacks-core/playbacks-telemetry/playbacks-telemetry.component';
import { PlaybacksTopActionsComponent } from './playbacks-top/playbacks-top-actions/playbacks-top-actions.component';
import { PlaybacksTopComponent } from './playbacks-top/playbacks-top.component';

@NgModule({
  declarations: [PlaybacksCoreComponent, PlaybacksTopComponent, PlaybacksTelemetryComponent, StreamPlaybackMapComponent, PlaybacksTopActionsComponent, StreamCorePlaybackVideosComponent, PlaybacksBottomComponent, StreamCorePlaybackChartsDownloadClipDialogComponent, StreamCorePlaybackChartsComponent],
  exports: [StreamCorePlaybackChartsComponent],
  imports: [StoreModule.forFeature(STREAM_FEATURE_KEY, streamReducer), EffectsModule.forFeature([StreamEffects]), SharedModule, VideoModule, CdkMenuModule, CdkAccordionModule, FormsModule, NgOptimizedImage, MatMenuModule, StarRatingModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PlaybacksModule {}
