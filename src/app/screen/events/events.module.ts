import { CdkMenuModule } from '@angular/cdk/menu';
import { NgOptimizedImage } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatMenuModule } from '@angular/material/menu';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { EventsCoreComponent } from 'src/app/screen/events/events-core/events-core.component';
import { EventsLeftComponent } from 'src/app/screen/events/events-left/events-left.component';
import { EventsTopComponent } from 'src/app/screen/events/events-top/events-top.component';
import { EventsEffects } from 'src/app/screen/events/events.effects';
import { EVENTS_FEATURE_KEY, eventsReducer } from 'src/app/screen/events/events.reducer';
import { SharedModule } from 'src/app/shared/shared.module';
import { SelectControlCounterModule } from '../../shared/component/control/select-control-counter/select-control-counter.module';
import { EventsChangeStatusDialogComponent } from '../../shared/component/dialog/events-change-status-dialog/events-change-status-dialog.component';
import { StarRatingModule } from '../../shared/component/star-rating/star-rating.module';
import { EventsCoreAuditTrailComponent } from './events-core/events-core-audit-trail/events-core-audit-trail.component';
import { EventsCoreCommentsComponent } from './events-core/events-core-comments/events-core-comments.component';
import { EventsCoreExtendEventComponent } from './events-core/events-core-extend-event/events-core-extend-event.component';
import { EventsCoreMapComponent } from './events-core/events-core-map/events-core-map.component';
import { EventsMapComponent } from './events-core/events-core-map/events-map/events-map.component';
import { EventsCoreSpeedChartComponent } from './events-core/events-core-speed-chart/events-core-speed-chart.component';
import { EventsCoreStatusComponent } from './events-core/events-core-status/events-core-status.component';
import { EventsCoreTripsDialogComponent } from './events-core/events-core-trips-dialog/events-core-trips-dialog.component';
import { EventsCoreVideosComponent } from './events-core/events-core-videos/events-core-videos.component';
import { EventsLeftFiltersComponent } from './events-left/events-left-filters/events-left-filters.component';
import { EventsLeftListComponent } from './events-left/events-left-list/events-left-list.component';
import { EventsLeftTelemetryComponent } from './events-left/events-left-telemetry/events-left-telemetry.component';
import { EventsTopMenuComponent } from './events-top/events-top-menu/events-top-menu.component';
import { EventsTopStatusComponent } from './events-top/events-top-status/events-top-status.component';

@NgModule({
  declarations: [EventsMapComponent, EventsCoreComponent, EventsLeftComponent, EventsTopComponent, EventsLeftFiltersComponent, EventsLeftListComponent, EventsTopMenuComponent, EventsTopStatusComponent, EventsCoreVideosComponent, EventsCoreMapComponent, EventsCoreTripsDialogComponent, EventsChangeStatusDialogComponent, EventsCoreCommentsComponent, EventsCoreAuditTrailComponent, EventsCoreSpeedChartComponent, EventsCoreStatusComponent, EventsLeftTelemetryComponent, EventsCoreExtendEventComponent],
  imports: [StoreModule.forFeature(EVENTS_FEATURE_KEY, eventsReducer), EffectsModule.forFeature([EventsEffects]), SharedModule, FormsModule, CdkMenuModule, NgOptimizedImage, SelectControlCounterModule, GoogleMapsModule, CdkMenuModule, MatMenuModule, StarRatingModule],
  exports: [EventsCoreComponent, EventsCoreVideosComponent, EventsCoreMapComponent, EventsCoreCommentsComponent, EventsCoreAuditTrailComponent, EventsCoreSpeedChartComponent, EventsCoreStatusComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EventsModule {}
