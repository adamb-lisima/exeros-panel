import { CdkMenuModule } from '@angular/cdk/menu';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { PlaybackCoreComponent } from './playback-core/playback-core.component';

@NgModule({
  declarations: [PlaybackCoreComponent],
  imports: [SharedModule, CdkMenuModule, FormsModule]
})
export class PlaybackModule {}
