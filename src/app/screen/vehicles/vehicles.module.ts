import { CdkAccordionModule } from '@angular/cdk/accordion';
import { CdkMenuModule } from '@angular/cdk/menu';
import { NgOptimizedImage } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from 'src/app/shared/shared.module';
import { VehicleStatusIconsModule } from '../../shared/component/vehicle-status-icons/vehicle-status-icons.module';
import { EventsModule } from '../events/events.module';
import { VehiclesCoreDetailsComponent } from './vehicles-core/vehicles-core-details/vehicles-core-details.component';
import { VehiclesCoreDistanceDrivenComponent } from './vehicles-core/vehicles-core-distance-driven/vehicles-core-distance-driven.component';
import { VehiclesCoreDrivingTimeComponent } from './vehicles-core/vehicles-core-driving-time/vehicles-core-driving-time.component';
import { VehiclesCoreLiveFeedComponent } from './vehicles-core/vehicles-core-live-feed/vehicles-core-live-feed.component';
import { VehiclesCoreTabsAccidentsDialogComponent } from './vehicles-core/vehicles-core-tabs/vehicles-core-tabs-accidents-dialog/vehicles-core-tabs-accidents-dialog.component';
import { VehiclesCoreTabsAccidentsComponent } from './vehicles-core/vehicles-core-tabs/vehicles-core-tabs-accidents/vehicles-core-tabs-accidents.component';
import { VehiclesCoreTabsAlarmsComponent } from './vehicles-core/vehicles-core-tabs/vehicles-core-tabs-alarms/vehicles-core-tabs-alarms.component';
import { VehiclesCoreTabsChecksDialogComponent } from './vehicles-core/vehicles-core-tabs/vehicles-core-tabs-checks-dialog/vehicles-core-tabs-checks-dialog.component';
import { VehiclesCoreTabsChecksComponent } from './vehicles-core/vehicles-core-tabs/vehicles-core-tabs-checks/vehicles-core-tabs-checks.component';
import { VehiclesCoreTabsEventsComponent } from './vehicles-core/vehicles-core-tabs/vehicles-core-tabs-events/vehicles-core-tabs-events.component';
import { VehiclesCoreTabsComponent } from './vehicles-core/vehicles-core-tabs/vehicles-core-tabs.component';
import { VehiclesCoreTripsComponent } from './vehicles-core/vehicles-core-trips/vehicles-core-trips.component';
import { VehiclesCoreComponent } from './vehicles-core/vehicles-core.component';
import { VehiclesLeftActionsComponent } from './vehicles-left/vehicles-left-actions/vehicles-left-actions.component';
import { VehiclesLeftEditCameraChannelsDialogComponent } from './vehicles-left/vehicles-left-edit-camera-channels-dialog/vehicles-left-edit-camera-channels-dialog.component';
import { VehiclesLeftListComponent } from './vehicles-left/vehicles-left-list/vehicles-left-list.component';
import { VehiclesLeftSearchComponent } from './vehicles-left/vehicles-left-search/vehicles-left-search.component';
import { VehiclesLeftComponent } from './vehicles-left/vehicles-left.component';
import { VehiclesTopComponent } from './vehicles-top/vehicles-top.component';
import { VehiclesEffects } from './vehicles.effects';
import { VEHICLES_FEATURE_KEY, vehiclesReducer } from './vehicles.reducer';

@NgModule({
  declarations: [VehiclesCoreComponent, VehiclesLeftComponent, VehiclesTopComponent, VehiclesLeftActionsComponent, VehiclesLeftSearchComponent, VehiclesLeftListComponent, VehiclesCoreDrivingTimeComponent, VehiclesCoreDistanceDrivenComponent, VehiclesCoreTabsComponent, VehiclesCoreTripsComponent, VehiclesCoreTabsAlarmsComponent, VehiclesCoreTabsEventsComponent, VehiclesCoreDetailsComponent, VehiclesLeftEditCameraChannelsDialogComponent, VehiclesCoreTabsChecksComponent, VehiclesCoreTabsChecksDialogComponent, VehiclesCoreTabsAccidentsComponent, VehiclesCoreTabsAccidentsDialogComponent, VehiclesCoreLiveFeedComponent],
  imports: [StoreModule.forFeature(VEHICLES_FEATURE_KEY, vehiclesReducer), EffectsModule.forFeature([VehiclesEffects]), SharedModule, CdkMenuModule, FormsModule, NgOptimizedImage, CdkAccordionModule, EventsModule, VehicleStatusIconsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VehiclesModule {}
