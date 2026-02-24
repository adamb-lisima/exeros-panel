import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app-store.model';
import { AccidentsElement, AccidentsParams } from '../../../../../service/http/accidents/accidents.model';
import { VehiclesActions } from '../../../vehicles.actions';
import { VehiclesSelectors } from '../../../vehicles.selectors';
import { VehiclesCoreTabsAccidentsDialogComponent, VehiclesCoreTabsAccidentsDialogData } from '../vehicles-core-tabs-accidents-dialog/vehicles-core-tabs-accidents-dialog.component';

@Component({
  selector: 'app-vehicles-core-tabs-accidents',
  templateUrl: './vehicles-core-tabs-accidents.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesCoreTabsAccidentsComponent {
  accidentsLoading$ = this.store.select(VehiclesSelectors.accidentsLoading);
  accidentsMeta$ = this.store.select(VehiclesSelectors.accidentsMeta);
  accidents$ = this.store.select(VehiclesSelectors.accidents);

  constructor(private readonly store: Store<AppState>, private readonly dialog: Dialog) {}

  handleNextPageRequest(page: AccidentsParams['page']): void {
    this.store.dispatch(VehiclesActions.fetchAccidents({ params: { page } }));
  }

  handleRowClick(accident: AccidentsElement): void {
    this.dialog.open<void, VehiclesCoreTabsAccidentsDialogData>(VehiclesCoreTabsAccidentsDialogComponent, { data: { id: accident.id } });
  }

  handleExportItemClick(event: MouseEvent, id: string): void {
    event.stopPropagation();
    this.store.dispatch(VehiclesActions.exportAccident({ id }));
  }

  handleExportItemKeyDown(id: string): void {
    const syntheticMouseEvent = {
      stopPropagation: () => {},
      preventDefault: () => {}
    } as MouseEvent;

    this.handleExportItemClick(syntheticMouseEvent, id);
  }
}
