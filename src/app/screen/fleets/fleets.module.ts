import { CdkMenuModule, CdkMenuTrigger } from '@angular/cdk/menu';
import { AsyncPipe, NgIf, NgOptimizedImage } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CalendarControlModule } from '../../shared/component/control/calendar/calendar-control.module';
import { SelectControlCounterModule } from '../../shared/component/control/select-control-counter/select-control-counter.module';
import { SelectControlModule } from '../../shared/component/control/select-control/select-control.module';
import { TreeControlModule } from '../../shared/component/control/tree-control/tree-control.module';
import { HasPermissionModule } from '../../shared/directive/has-permission/has-permission.module';
import { UnitAdderModule } from '../../shared/pipe/unit-adder/unit-adder.module';
import { SharedModule } from '../../shared/shared.module';
import { FleetsChartsFiltersComponent } from './fleets-core/fleets-charts-filters/fleets-charts-filters.component';
import { FleetsChartsTabComponent } from './fleets-core/fleets-charts-tab/fleets-charts-tab.component';
import { FleetsCoreActiveVehiclesComponent } from './fleets-core/fleets-core-active-vehicles/fleets-core-active-vehicles.component';
import { FleetsCoreDistractionComponent } from './fleets-core/fleets-core-distraction/fleets-core-distraction.component';
import { FleetsCoreEscalationsComponent } from './fleets-core/fleets-core-escalations/fleets-core-escalations.component';
import { FleetsCoreEventTypeComponent } from './fleets-core/fleets-core-event-type/fleets-core-event-type.component';
import { FleetsCoreEventsPerVehicleComponent } from './fleets-core/fleets-core-events-per-vehicle/fleets-core-events-per-vehicle.component';
import { FleetsCoreEventsToReviewComponent } from './fleets-core/fleets-core-events-to-review/fleets-core-events-to-review.component';
import { FleetsCoreFatigueComponent } from './fleets-core/fleets-core-fatigue/fleets-core-fatigue.component';
import { FleetsCoreNoDriverComponent } from './fleets-core/fleets-core-no-driver/fleets-core-no-driver.component';
import { FleetsCoreComponent } from './fleets-core/fleets-core.component';
import { FleetsMapComponent } from './fleets-core/fleets-map/fleets-map.component';
import { FleetsTopActionsComponent } from './fleets-top/fleets-top-actions/fleets-top-actions.component';
import { FleetsTopTimelineComponent } from './fleets-top/fleets-top-timeline/fleets-top-timeline.component';
import { FleetsTopComponent } from './fleets-top/fleets-top.component';
import { FleetsEffects } from './fleets.effects';
import { FLEETS_EVENTS_KEY, fleetsReducer } from './fleets.reducer';

@NgModule({
  declarations: [FleetsCoreComponent, FleetsTopComponent, FleetsCoreFatigueComponent, FleetsCoreDistractionComponent, FleetsCoreNoDriverComponent, FleetsCoreActiveVehiclesComponent, FleetsCoreEventsToReviewComponent, FleetsCoreEscalationsComponent, FleetsCoreEventTypeComponent, FleetsCoreEventsPerVehicleComponent, FleetsTopActionsComponent, FleetsTopComponent, FleetsMapComponent, FleetsChartsTabComponent, FleetsTopTimelineComponent, FleetsChartsFiltersComponent, FleetsCoreEventsToReviewComponent],
  imports: [StoreModule.forFeature(FLEETS_EVENTS_KEY, fleetsReducer), EffectsModule.forFeature([FleetsEffects]), SharedModule, FormsModule, AsyncPipe, CdkMenuModule, SelectControlCounterModule, HasPermissionModule, NgOptimizedImage, SelectControlModule, NgIf, TreeControlModule, ReactiveFormsModule, CalendarControlModule, CdkMenuTrigger, NgApexchartsModule, MatIconModule, UnitAdderModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FleetsModule {}
