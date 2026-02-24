import { CdkAccordionModule } from '@angular/cdk/accordion';
import { CdkMenuModule } from '@angular/cdk/menu';
import { NgOptimizedImage } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StreamCoreLiveFeedVideosComponent } from 'src/app/screen/stream/stream-core/stream-core-live-feed-videos/stream-core-live-feed-videos.component';
import { StreamCoreComponent } from 'src/app/screen/stream/stream-core/stream-core.component';
import { StreamLeftLiveFeedDriverComponent } from 'src/app/screen/stream/stream-left/stream-left-live-feed-driver/stream-left-live-feed-driver.component';
import { StreamLeftLiveFeedMapComponent } from 'src/app/screen/stream/stream-left/stream-left-live-feed-map/stream-left-live-feed-map.component';
import { StreamLeftLiveFeedMenuComponent } from 'src/app/screen/stream/stream-left/stream-left-live-feed-menu/stream-left-live-feed-menu.component';
import { StreamLeftLiveFeedUpdatesComponent } from 'src/app/screen/stream/stream-left/stream-left-live-feed-updates/stream-left-live-feed-updates.component';
import { StreamLeftVehiclesListComponent } from 'src/app/screen/stream/stream-left/stream-left-vehicles-list/stream-left-vehicles-list.component';
import { StreamLeftVehiclesSearchComponent } from 'src/app/screen/stream/stream-left/stream-left-vehicles-search/stream-left-vehicles-search.component';
import { StreamLeftComponent } from 'src/app/screen/stream/stream-left/stream-left.component';
import { StreamTopComponent } from 'src/app/screen/stream/stream-top/stream-top.component';
import { StreamEffects } from 'src/app/screen/stream/stream.effects';
import { STREAM_FEATURE_KEY, streamReducer } from 'src/app/screen/stream/stream.reducer';
import { SharedModule } from 'src/app/shared/shared.module';
import { SelectControlCounterModule } from '../../shared/component/control/select-control-counter/select-control-counter.module';
import { StarRatingModule } from '../../shared/component/star-rating/star-rating.module';
import { TimelineEventVideoModule } from '../../shared/component/timeline/timeline-event-video/timeline-event-video.module';
import { VehicleStatusIconsModule } from '../../shared/component/vehicle-status-icons/vehicle-status-icons.module';
import { VideoModule } from '../../shared/component/video/video.module';
import { StreamCorePlaybackChartsClipToEventComponent } from './stream-core/stream-core-playback-charts-clip-to-event/stream-core-playback-charts-clip-to-event.component';
import { StreamCorePlaybackChartsShareClipDialogComponent } from './stream-core/stream-core-playback-charts-share-clip-dialog/stream-core-playback-charts-share-clip-dialog.component';
import { StreamCoreTelemetryComponent } from './stream-core/stream-core-telemetry/stream-core-telemetry.component';
import { StreamMainComponent } from './stream-core/stream-main/stream-main.component';
import { StreamLeftLiveFeedDriverMessageDialogComponent } from './stream-left/stream-left-live-feed-driver-message-dialog/stream-left-live-feed-driver-message-dialog.component';
import { StreamLeftRecentEventComponent } from './stream-left/stream-left-recent-event/stream-left-recent-event.component';
import { StreamPlaybackCalendarComponent } from './stream-left/stream-playback-calendar/stream-playback-calendar.component';
import { StreamTopMainComponent } from './stream-top/stream-top-main/stream-top-main.component';

@NgModule({
  declarations: [StreamCoreComponent, StreamLeftComponent, StreamTopComponent, StreamLeftVehiclesSearchComponent, StreamLeftVehiclesListComponent, StreamLeftLiveFeedMenuComponent, StreamLeftLiveFeedMapComponent, StreamLeftLiveFeedDriverComponent, StreamLeftLiveFeedDriverMessageDialogComponent, StreamLeftLiveFeedUpdatesComponent, StreamCoreLiveFeedVideosComponent, StreamPlaybackCalendarComponent, StreamLeftRecentEventComponent, StreamCoreTelemetryComponent, StreamMainComponent, StreamTopMainComponent, StreamCorePlaybackChartsShareClipDialogComponent, StreamCorePlaybackChartsClipToEventComponent],
  imports: [StoreModule.forFeature(STREAM_FEATURE_KEY, streamReducer), EffectsModule.forFeature([StreamEffects]), SharedModule, CdkMenuModule, CdkAccordionModule, FormsModule, NgOptimizedImage, MatFormFieldModule, MatInputModule, MatIconModule, MatOptionModule, MatSelectModule, MatButtonModule, MatMenuModule, StarRatingModule, VehicleStatusIconsModule, SelectControlCounterModule, TimelineEventVideoModule, VideoModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class StreamModule {}
