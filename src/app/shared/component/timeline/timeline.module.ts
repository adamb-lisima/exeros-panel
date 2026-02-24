import { CdkMenu, CdkMenuTrigger } from '@angular/cdk/menu';
import { OverlayModule } from '@angular/cdk/overlay';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { NgModule } from '@angular/core';
import { HasPermissionModule } from '../../directive/has-permission/has-permission.module';
import { NgForTrackByFieldModule } from '../../directive/ng-for-track-by-field/ng-for-track-by-field.module';
import { TooltipModule } from '../../directive/tooltip/tooltip.module';
import { PipeModule } from '../../pipe/pipe.module';
import { ButtonModule } from '../button/button.module';
import { EventIconModule } from '../event-icon/event-icon.module';
import { MapModule } from '../map/map.module';
import { VideoModule } from '../video/video.module';
import { TimelineEventsIconComponent } from './timeline-events-icon/timeline-events-icon.component';
import { TimelineEventsComponent } from './timeline-events/timeline-events.component';
import { TimelineFuelGraphComponent } from './timeline-fuel-graph/timeline-fuel-graph.component';
import { TimelineSpeedGraphComponent } from './timeline-speed-graph/timeline-speed-graph.component';
import { TimelineTabMenuItemDirective } from './timeline-tab-menu-item.directive';
import { TimelineTabDirective } from './timeline-tab.directive';
import { TimelineTabsComponent } from './timeline-tabs/timeline-tabs.component';
import { TimelineComponent } from './timeline.component';

@NgModule({
  declarations: [TimelineTabsComponent, TimelineEventsComponent, TimelineSpeedGraphComponent, TimelineFuelGraphComponent, TimelineComponent, TimelineTabDirective, TimelineEventsIconComponent, TimelineTabMenuItemDirective],
  imports: [CommonModule, OverlayModule, ScrollingModule, PipeModule, NgOptimizedImage, CdkMenuTrigger, ButtonModule, CdkMenu, TooltipModule, MapModule, NgForTrackByFieldModule, VideoModule, EventIconModule, HasPermissionModule],
  exports: [TimelineComponent]
})
export class TimelineModule {}
