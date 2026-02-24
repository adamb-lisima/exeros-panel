import { CdkAccordionModule } from '@angular/cdk/accordion';
import { CdkMenuModule } from '@angular/cdk/menu';
import { NgOptimizedImage } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from 'src/app/shared/shared.module';
import { StarRatingModule } from '../../shared/component/star-rating/star-rating.module';
import { EventsModule } from '../events/events.module';
import { DriversCoreAverageScoreComponent } from './drivers-core/drivers-core-average-score/drivers-core-average-score.component';
import { DriversCoreCurrentScoreComponent } from './drivers-core/drivers-core-current-score/drivers-core-current-score.component';
import { DriversCoreDistanceDrivenComponent } from './drivers-core/drivers-core-distance-driven/drivers-core-distance-driven.component';
import { DriversCoreDrivingTimeComponent } from './drivers-core/drivers-core-driving-time/drivers-core-driving-time.component';
import { DriversCoreEventsCountComponent } from './drivers-core/drivers-core-events-count/drivers-core-events-count.component';
import { DriversEventsImpactComponent } from './drivers-core/drivers-core-events-impact/drivers-core-events-impact.component';
import { DriversCoreLiveFeedComponent } from './drivers-core/drivers-core-live-feed/drivers-core-live-feed.component';
import { DriversCoreSafetyScoresComponent } from './drivers-core/drivers-core-safety-scores/drivers-core-safety-scores.component';
import { DriversCoreSafetySpiderComponent } from './drivers-core/drivers-core-safety-spider/drivers-core-safety-spider.component';
import { DriversCoreTabsAccidentsDialogComponent } from './drivers-core/drivers-core-tabs/drivers-core-tabs-accidents-dialog/drivers-core-tabs-accidents-dialog.component';
import { DriversCoreTabsAccidentsComponent } from './drivers-core/drivers-core-tabs/drivers-core-tabs-accidents/drivers-core-tabs-accidents.component';
import { DriversCoreTabsAlarmsComponent } from './drivers-core/drivers-core-tabs/drivers-core-tabs-alarms/drivers-core-tabs-alarms.component';
import { DriversCoreTabsChecksDialogComponent } from './drivers-core/drivers-core-tabs/drivers-core-tabs-checks-dialog/drivers-core-tabs-checks-dialog.component';
import { DriversCoreTabsChecksComponent } from './drivers-core/drivers-core-tabs/drivers-core-tabs-checks/drivers-core-tabs-checks.component';
import { DriversCoreTabsEventsComponent } from './drivers-core/drivers-core-tabs/drivers-core-tabs-events/drivers-core-tabs-events.component';
import { DriversCoreTabsComponent } from './drivers-core/drivers-core-tabs/drivers-core-tabs.component';
import { DriversCoreTripsComponent } from './drivers-core/drivers-core-trips/drivers-core-trips.component';
import { DriversCoreVehicleCheckComponent } from './drivers-core/drivers-core-vehicle-check/drivers-core-vehicle-check.component';
import { DriversCoreComponent } from './drivers-core/drivers-core.component';
import { DriversLeftActionsComponent } from './drivers-left/drivers-left-actions/drivers-left-actions.component';
import { DriversLeftListComponent } from './drivers-left/drivers-left-list/drivers-left-list.component';
import { DriversLeftMessageDialogComponent } from './drivers-left/drivers-left-message-dialog/drivers-left-message-dialog.component';
import { DriversLeftSearchComponent } from './drivers-left/drivers-left-search/drivers-left-search.component';
import { DriversLeftComponent } from './drivers-left/drivers-left.component';
import { DriversTopComponent } from './drivers-top/drivers-top.component';
import { DriversEffects } from './drivers.effects';
import { DRIVERS_FEATURE_KEY, driversReducer } from './drivers.reducer';

@NgModule({
  declarations: [DriversCoreSafetySpiderComponent, DriversCoreVehicleCheckComponent, DriversCoreAverageScoreComponent, DriversCoreCurrentScoreComponent, DriversCoreEventsCountComponent, DriversCoreComponent, DriversLeftComponent, DriversTopComponent, DriversLeftActionsComponent, DriversLeftSearchComponent, DriversLeftListComponent, DriversCoreDrivingTimeComponent, DriversCoreDistanceDrivenComponent, DriversCoreTabsComponent, DriversCoreSafetyScoresComponent, DriversCoreTripsComponent, DriversCoreTabsAlarmsComponent, DriversCoreTabsEventsComponent, DriversLeftMessageDialogComponent, DriversCoreTabsChecksComponent, DriversCoreTabsChecksDialogComponent, DriversCoreTabsAccidentsComponent, DriversCoreTabsAccidentsDialogComponent, DriversCoreLiveFeedComponent, DriversEventsImpactComponent],
  imports: [CdkAccordionModule, StoreModule.forFeature(DRIVERS_FEATURE_KEY, driversReducer), EffectsModule.forFeature([DriversEffects]), SharedModule, CdkMenuModule, FormsModule, NgOptimizedImage, StarRatingModule, EventsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DriversModule {}
