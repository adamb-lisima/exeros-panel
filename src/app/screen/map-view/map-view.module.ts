import { CdkAccordionModule } from '@angular/cdk/accordion';
import { CdkMenuModule, CdkMenuTrigger } from '@angular/cdk/menu';
import { AsyncPipe, CommonModule, NgIf, NgOptimizedImage } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CalendarControlModule } from '../../shared/component/control/calendar/calendar-control.module';
import { SelectControlCounterModule } from '../../shared/component/control/select-control-counter/select-control-counter.module';
import { SelectControlModule } from '../../shared/component/control/select-control/select-control.module';
import { TimeSelectControlModule } from '../../shared/component/control/time-select-control/time-select-control.module';
import { TreeControlModule } from '../../shared/component/control/tree-control/tree-control.module';
import { HasPermissionModule } from '../../shared/directive/has-permission/has-permission.module';
import { UnitAdderModule } from '../../shared/pipe/unit-adder/unit-adder.module';
import { SharedModule } from '../../shared/shared.module';
import { MapViewCoreComponent } from './map-view-core/map-view-core.component';
import { MapViewLeftListComponent } from './map-view-left/map-view-left-list/map-view-left-list.component';
import { MapViewLeftSearchComponent } from './map-view-left/map-view-left-search/map-view-left-search.component';
import { MapViewLeftComponent } from './map-view-left/map-view-left.component';
import { MapViewTopComponent } from './map-view-top/map-view-top.component';

@NgModule({
  declarations: [MapViewCoreComponent, MapViewLeftComponent, MapViewTopComponent, MapViewLeftListComponent, MapViewLeftSearchComponent],
  imports: [SharedModule, FormsModule, AsyncPipe, CdkMenuModule, SelectControlCounterModule, HasPermissionModule, NgOptimizedImage, SelectControlModule, NgIf, TreeControlModule, ReactiveFormsModule, CalendarControlModule, CdkMenuTrigger, NgApexchartsModule, MatIconModule, UnitAdderModule, CommonModule, RouterModule, CdkAccordionModule, TimeSelectControlModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatOptionModule, MatSelectModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MapViewModule {}
