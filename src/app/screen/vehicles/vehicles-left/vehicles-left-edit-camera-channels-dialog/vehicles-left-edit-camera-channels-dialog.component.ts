import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, Subject, Subscription, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppState } from '../../../../store/app-store.model';
import { waitOnceForAction } from '../../../../util/operators';
import { VehiclesActions } from '../../vehicles.actions';
import { UpdateCameraChannelBody } from '../../vehicles.model';
import { VehiclesSelectors } from '../../vehicles.selectors';

export interface VehiclesLeftEditCameraChannelsDialogData {
  vehicleId: number;
}

@Component({
  templateUrl: './vehicles-left-edit-camera-channels-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesLeftEditCameraChannelsDialogComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private subscriptions = new Subscription();

  formGroups$ = this.store.select(VehiclesSelectors.cameraChannels).pipe(
    map(cameraChannels =>
      cameraChannels.map(cameraChannel =>
        this.fb.group<UpdateCameraChannelBody>({
          id: cameraChannel.id,
          // @ts-ignore
          channel: this.fb.control({ value: cameraChannel.channel, disabled: true }),
          name: cameraChannel.name,
          active: cameraChannel.active
        })
      )
    )
  );

  constructor(@Inject(DIALOG_DATA) public data: VehiclesLeftEditCameraChannelsDialogData, private readonly dialogRef: DialogRef, private readonly fb: FormBuilder, private readonly store: Store<AppState>, private readonly actions$: Actions) {}

  ngOnInit(): void {
    this.store.dispatch(VehiclesActions.fetchCameraChannels({ vehicleId: this.data.vehicleId }));
  }

  ngOnDestroy(): void {
    this.store.dispatch(VehiclesActions.resetCameraChannels());
  }

  handleCloseClick(): void {
    this.dialogRef.close();
  }

  handleUpdateClick(formGroups: FormGroup[]) {
    this.store.dispatch(
      VehiclesActions.updateCameraChannels({
        bodies: formGroups.filter(formGroup => formGroup.dirty).map(formGroup => formGroup.getRawValue())
      })
    );

    const subscription = this.actions$
      .pipe(
        waitOnceForAction([VehiclesActions.updateCameraChannelsSuccess]),
        tap(() => this.dialogRef.close()),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.subscriptions.add(subscription);
  }
}
