import { NgModule } from '@angular/core';
import { ButtonModule } from 'src/app/shared/component/button/button.module';
import { CalendarModule } from 'src/app/shared/component/calendar/calendar.module';
import { ControlModule } from 'src/app/shared/component/control/control.module';
import { DialogModule } from 'src/app/shared/component/dialog/dialog.module';
import { InfinityScrollModule } from 'src/app/shared/component/infinity-scroll/infinity-scroll.module';
import { MapModule } from 'src/app/shared/component/map/map.module';
import { TimelineModule } from 'src/app/shared/component/timeline/timeline.module';
import { SmaxVideoModule } from 'src/app/shared/component/smax-video/smax-video.module';
import { AccordionModule } from './accordion/accordion.module';
import { CalendarMiniModule } from './calendar-mini/calendar-mini.module';
import { ChartModule } from './chart/chart.module';
import { EventIconModule } from './event-icon/event-icon.module';
import { ExportButtonsModule } from './export-buttons/export-buttons.module';
import { PaginatorModule } from './paginator/paginator.module';
import { ReportIssueModalModule } from './report-issue-modal/report-issue-modal.module';
import { TelemetryHeaderModule } from './telemetry-header/telemetry-header.module';
import { TelemetryMetricsModule } from './telemetry-metrics/telemetry-metrics.module';
import { SkeletonLoaderModule } from './skeleton-loader/skeleton-loader.module';
import { CardModule } from './card/card.module';
import { ToastModule } from './toast/toast.module';
import { DialogWrapperModule } from './dialog-wrapper/dialog-wrapper.module';
import { EmptyStateModule } from './empty-state/empty-state.module';
import { BadgeModule } from './badge/badge.module';
import { TagModule } from './tag/tag.module';
import { CountBadgeModule } from './count-badge/count-badge.module';
import { TabsModule } from './tabs/tabs.module';
import { ErrorPageModule } from './error-page/error-page.module';

@NgModule({
  exports: [ReportIssueModalModule, SmaxVideoModule, MapModule, ButtonModule, ControlModule, InfinityScrollModule, DialogModule, CalendarModule, TimelineModule, ChartModule, EventIconModule, PaginatorModule, AccordionModule, CalendarMiniModule, TelemetryHeaderModule, TelemetryMetricsModule, ExportButtonsModule, SkeletonLoaderModule, CardModule, ToastModule, DialogWrapperModule, EmptyStateModule, BadgeModule, TagModule, CountBadgeModule, TabsModule, ErrorPageModule]
})
export class ComponentModule {}
