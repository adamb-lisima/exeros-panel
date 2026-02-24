import { DialogModule as CdkDialogModule } from '@angular/cdk/dialog';
import { NgModule } from '@angular/core';
import { ConfirmationDialogModule } from 'src/app/shared/component/dialog/confirmation-dialog/confirmation-dialog.module';
import { MfaInactivityDialogModule } from 'src/app/shared/component/dialog/mfa-inactivity-dialog/mfa-inactivity-dialog.module';
import { AccidentBaseDialogModule } from './accident-base-dialog/accident-base-dialog.module';
import { AccidentsTabBaseModule } from './accidents-tab-base/accidents-tab-base.module';
import { DialogContainerModule } from './dialog-container/dialog-container.module';
import { EventsTabBaseModule } from './events-tab-base/events-tab-base.module';
import { ReasonRejectDialogModule } from './reason-reject-dialog/reason-reject-dialog.module';
import { ReviewConfirmModule } from './review-confirm/review-confirm.module';
import { TripsBaseModule } from './trips-base/trips-base.module';
import { VehicleCheckBaseDialogModule } from './vehicle-check-base-dialog/vehicle-check-base-dialog.module';
import { VehicleCheckTabBaseModule } from './vehicle-check-tab-base/vehicle-check-tab-base.module';

@NgModule({
  exports: [ConfirmationDialogModule, CdkDialogModule, DialogContainerModule, MfaInactivityDialogModule, AccidentBaseDialogModule, VehicleCheckBaseDialogModule, TripsBaseModule, EventsTabBaseModule, VehicleCheckTabBaseModule, AccidentsTabBaseModule, ReviewConfirmModule, ReasonRejectDialogModule]
})
export class DialogModule {}
