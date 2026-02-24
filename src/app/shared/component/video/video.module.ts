import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { VideoLiveComponent } from './video-live/video-live.component';
import { VideoPlaybackComponent } from './video-playback/video-playback.component';
import { SmaxVideoModule } from '../smax-video/smax-video.module';
import { PipeModule } from '../../pipe/pipe.module';
import { DirectiveModule } from '../../directive/directive.module';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [VideoLiveComponent, VideoPlaybackComponent],
  imports: [CommonModule, ReactiveFormsModule, MatMenuModule, SmaxVideoModule, PipeModule, DirectiveModule],
  exports: [VideoLiveComponent, VideoPlaybackComponent]
})
export class VideoModule {}
