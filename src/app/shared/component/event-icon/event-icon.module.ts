import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { NgModule } from '@angular/core';
import { PipeModule } from '../../pipe/pipe.module';
import { EventIconComponent } from './event-icon.component';

@NgModule({
  declarations: [EventIconComponent],
  imports: [CommonModule, OverlayModule, PipeModule, NgOptimizedImage],
  exports: [EventIconComponent]
})
export class EventIconModule {}
