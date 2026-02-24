import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { MapMarkerData } from 'src/app/model/map.model';
import { DriversActions } from '../../../drivers.actions';
import { DriversSelectors } from '../../../drivers.selectors';

export interface DriversCoreTabsAccidentsDialogData {
  id: string;
}

@Component({
  selector: 'app-drivers-core-tabs-accidents-dialog',
  templateUrl: './drivers-core-tabs-accidents-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriversCoreTabsAccidentsDialogComponent implements OnInit, OnDestroy {
  accident$ = this.store.select(DriversSelectors.accident);

  markers$: Observable<MapMarkerData[]> = this.accident$.pipe(
    map(accident =>
      accident
        ? [
            {
              id: accident.id ?? '',
              coordinates: [accident.coordinates.lat, accident.coordinates.lng],
              type: 'end'
            }
          ]
        : []
    )
  );

  constructor(@Inject(DIALOG_DATA) public data: DriversCoreTabsAccidentsDialogData, private readonly dialogRef: DialogRef, private readonly store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(DriversActions.fetchAccident({ id: this.data.id }));
  }

  ngOnDestroy(): void {
    this.store.dispatch(DriversActions.resetAccident());
  }

  handleCloseClick(): void {
    this.dialogRef.close();
  }
}
