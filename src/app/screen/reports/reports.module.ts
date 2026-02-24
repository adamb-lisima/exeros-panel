import { CdkMenuModule } from '@angular/cdk/menu';
import { NgOptimizedImage } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { ReportsCoreComponent } from 'src/app/screen/reports/reports-core/reports-core.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { StarRatingModule } from '../../shared/component/star-rating/star-rating.module';
import { ReportsCoreAccidentsDialogComponent } from './reports-core/reports-core-accidents-dialog/reports-core-accidents-dialog.component';
import { ReportsCoreAccidentsComponent } from './reports-core/reports-core-accidents/reports-core-accidents.component';
import { ReportsCoreDistanceDrivenComponent } from './reports-core/reports-core-distance-driven/reports-core-distance-driven.component';
import { ReportsCoreDrivingTimeComponent } from './reports-core/reports-core-driving-time/reports-core-driving-time.component';
import { ReportsCoreMileageComponent } from './reports-core/reports-core-mileage/reports-core-mileage.component';
import { ReportsCoreSlideFiltersComponent } from './reports-core/reports-core-slide-filters/reports-core-slide-filters.component';
import { ReportsCoreTripsComponent } from './reports-core/reports-core-trips/reports-core-trips.component';
import { ReportsCoreUserLogsComponent } from './reports-core/reports-core-user-logs/reports-core-user-logs.component';
import { ReportsCoreVehicleIssuesComponent } from './reports-core/reports-core-vehicle-issues/reports-core-vehicle-issues.component';
import { ReportsCoreVehicleOnlineStatusComponent } from './reports-core/reports-core-vehicle-online-status/reports-core-vehicle-online-status.component';
import { ReportsCoreVehiclesEventsComponent } from './reports-core/reports-core-vehicles-events/reports-core-vehicles-events.component';
import { ReportsCoreVehiclesAlarmsComponent } from './reports-core/reports-core-vehicles-alarms/reports-core-vehicles-alarms.component';
import { ReportsCoreVehiclesChecksDialogComponent } from './reports-core/reports-core-vehicles-checks-dialog/reports-core-vehicles-checks-dialog.component';
import { ReportsCoreVehiclesChecksComponent } from './reports-core/reports-core-vehicles-checks/reports-core-vehicles-checks.component';
import { ReportsTopComponent } from './reports-top/reports-top.component';
import { ReportsEffects } from './reports.effects';
import { REPORTS_FEATURE_KEY, reportsReducer } from './reports.reducer';

@NgModule({
  declarations: [ReportsCoreSlideFiltersComponent, ReportsCoreComponent, ReportsCoreDrivingTimeComponent, ReportsCoreMileageComponent, ReportsTopComponent, ReportsCoreVehicleIssuesComponent, ReportsCoreVehiclesChecksComponent, ReportsCoreVehiclesEventsComponent, ReportsCoreVehiclesAlarmsComponent, ReportsCoreDistanceDrivenComponent, ReportsCoreVehicleOnlineStatusComponent, ReportsCoreUserLogsComponent, ReportsCoreAccidentsComponent, ReportsCoreTripsComponent, ReportsCoreAccidentsDialogComponent, ReportsCoreVehiclesChecksDialogComponent],
  imports: [StoreModule.forFeature(REPORTS_FEATURE_KEY, reportsReducer), EffectsModule.forFeature([ReportsEffects]), SharedModule, FormsModule, CdkMenuModule, NgOptimizedImage, MatIconModule, StarRatingModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ReportsModule {}
