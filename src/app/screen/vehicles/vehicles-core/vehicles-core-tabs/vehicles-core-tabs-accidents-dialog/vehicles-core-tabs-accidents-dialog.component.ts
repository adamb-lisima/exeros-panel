import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { MapMarkerData } from 'src/app/model/map.model';
import { VehiclesActions } from '../../../vehicles.actions';
import { VehiclesSelectors } from '../../../vehicles.selectors';

export interface VehiclesCoreTabsAccidentsDialogData {
  id: string;
}

@Component({
  selector: 'app-vehicles-core-tabs-accidents-dialog',
  templateUrl: './vehicles-core-tabs-accidents-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesCoreTabsAccidentsDialogComponent implements OnInit, OnDestroy {
  accident$ = this.store.select(VehiclesSelectors.accident);

  markers$: Observable<MapMarkerData[]> = this.accident$.pipe(
    map(accident => [
      {
        id: accident?.id ?? '',
        coordinates: [accident?.coordinates.lat, accident?.coordinates.lng],
        type: 'end'
      }
    ])
  );

  constructor(@Inject(DIALOG_DATA) public data: VehiclesCoreTabsAccidentsDialogData, private readonly dialogRef: DialogRef, private readonly store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(VehiclesActions.fetchAccident({ id: this.data.id }));
  }

  ngOnDestroy(): void {
    this.store.dispatch(VehiclesActions.resetAccident());
  }

  handleCloseClick(): void {
    this.dialogRef.close();
  }
}
