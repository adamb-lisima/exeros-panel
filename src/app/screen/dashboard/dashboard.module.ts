import { CdkMenuModule } from '@angular/cdk/menu';
import { NgOptimizedImage } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { DashboardCoreAccidentsComponent } from 'src/app/screen/dashboard/dashboard-core/dashboard-core-accidents/dashboard-core-accidents.component';
import { DashboardCoreDrivingTimeComponent } from 'src/app/screen/dashboard/dashboard-core/dashboard-core-driving-time/dashboard-core-driving-time.component';
import { DashboardCoreEventsComponent } from 'src/app/screen/dashboard/dashboard-core/dashboard-core-events/dashboard-core-events.component';
import { DashboardCoreMapComponent } from 'src/app/screen/dashboard/dashboard-core/dashboard-core-map/dashboard-core-map.component';
import { DashboardCoreVehiclesChecksComponent } from 'src/app/screen/dashboard/dashboard-core/dashboard-core-vehicles-checks/dashboard-core-vehicles-checks.component';
import { DashboardCoreComponent } from 'src/app/screen/dashboard/dashboard-core/dashboard-core.component';
import { DashboardTopComponent } from 'src/app/screen/dashboard/dashboard-top/dashboard-top.component';
import { DashboardEffects } from 'src/app/screen/dashboard/dashboard.effects';
import { DASHBOARD_FEATURE_KEY, dashboardReducer } from 'src/app/screen/dashboard/dashboard.reducer';
import { SharedModule } from 'src/app/shared/shared.module';
import { DashboardCoreAccidentsDialogComponent } from './dashboard-core/dashboard-core-accidents-dialog/dashboard-core-accidents-dialog.component';
import { DashboardCoreVehiclesChecksDialogComponent } from './dashboard-core/dashboard-core-vehicles-checks-dialog/dashboard-core-vehicles-checks-dialog.component';

@NgModule({
  declarations: [DashboardCoreComponent, DashboardCoreDrivingTimeComponent, DashboardCoreEventsComponent, DashboardCoreVehiclesChecksComponent, DashboardCoreAccidentsComponent, DashboardTopComponent, DashboardCoreMapComponent, DashboardCoreAccidentsDialogComponent, DashboardCoreVehiclesChecksDialogComponent],
  imports: [StoreModule.forFeature(DASHBOARD_FEATURE_KEY, dashboardReducer), EffectsModule.forFeature([DashboardEffects]), SharedModule, CdkMenuModule, FormsModule, NgOptimizedImage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardModule {}
