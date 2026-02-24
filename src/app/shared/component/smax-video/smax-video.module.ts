import { CdkMenuModule } from '@angular/cdk/menu';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SmaxVideoH265Component } from 'src/app/shared/component/smax-video/video-h265/smax-video-h265.component';
import { SmaxVideoMp4Component } from 'src/app/shared/component/smax-video/video-mp4/smax-video-mp4.component';

@NgModule({
  declarations: [SmaxVideoMp4Component, SmaxVideoH265Component],
  exports: [SmaxVideoMp4Component, SmaxVideoH265Component],
  imports: [CommonModule, CdkMenuModule]
})
export class SmaxVideoModule {}
