import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { MapMarkerData } from 'src/app/model/map.model';
import { ReportsActions } from '../../reports.actions';
import { ReportsSelectors } from '../../reports.selectors';

export interface ReportsCoreAccidentsDialogData {
  id: string;
}

@Component({
  selector: 'app-reports-core-accidents-dialog',
  templateUrl: './reports-core-accidents-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsCoreAccidentsDialogComponent implements OnInit, OnDestroy {
  accident$ = this.store.select(ReportsSelectors.accident);

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

  constructor(@Inject(DIALOG_DATA) public data: ReportsCoreAccidentsDialogData, private readonly dialogRef: DialogRef, private readonly store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(ReportsActions.fetchAccident({ id: this.data.id }));
  }

  ngOnDestroy(): void {
    this.store.dispatch(ReportsActions.resetAccident());
  }

  handleCloseClick(): void {
    this.dialogRef.close();
  }
}
