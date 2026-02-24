import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app-store.model';
import { AccidentsElement, AccidentsParams } from '../../../../../service/http/accidents/accidents.model';
import { DriversActions } from '../../../drivers.actions';
import { DriversSelectors } from '../../../drivers.selectors';
import { DriversCoreTabsAccidentsDialogComponent, DriversCoreTabsAccidentsDialogData } from '../drivers-core-tabs-accidents-dialog/drivers-core-tabs-accidents-dialog.component';

@Component({
  selector: 'app-drivers-core-tabs-accidents',
  templateUrl: './drivers-core-tabs-accidents.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriversCoreTabsAccidentsComponent {
  accidentsLoading$ = this.store.select(DriversSelectors.accidentsLoading);
  accidentsMeta$ = this.store.select(DriversSelectors.accidentsMeta);
  accidents$ = this.store.select(DriversSelectors.accidents);

  constructor(private readonly store: Store<AppState>, private readonly dialog: Dialog) {}

  handleNextPageRequest(page: AccidentsParams['page']): void {
    this.store.dispatch(DriversActions.fetchAccidents({ params: { page } }));
  }

  handleRowClick(accident: AccidentsElement): void {
    this.dialog.open<void, DriversCoreTabsAccidentsDialogData>(DriversCoreTabsAccidentsDialogComponent, { data: { id: accident.id } });
  }

  handleExportItemClick(event: MouseEvent, id: string): void {
    event.stopPropagation();
    this.store.dispatch(DriversActions.exportAccident({ id }));
  }

  handleExportItemKeyDown(id: string): void {
    const syntheticMouseEvent = {
      stopPropagation: () => {},
      preventDefault: () => {}
    } as MouseEvent;

    this.handleExportItemClick(syntheticMouseEvent, id);
  }
}
