import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { DashboardActions } from 'src/app/screen/dashboard/dashboard.actions';
import { DashboardSelectors } from 'src/app/screen/dashboard/dashboard.selectors';
import { AppState } from 'src/app/store/app-store.model';
import { AccidentsElement, AccidentsParams } from '../../../../service/http/accidents/accidents.model';
import { DashboardCoreAccidentsDialogComponent, DashboardCoreAccidentsDialogData } from '../dashboard-core-accidents-dialog/dashboard-core-accidents-dialog.component';

@Component({
  selector: 'app-dashboard-core-accidents',
  templateUrl: './dashboard-core-accidents.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardCoreAccidentsComponent {
  accidentsLoading$ = this.store.select(DashboardSelectors.accidentsLoading);
  accidentsMeta$ = this.store.select(DashboardSelectors.accidentsMeta);
  accidents$ = this.store.select(DashboardSelectors.accidents);

  constructor(private readonly store: Store<AppState>, private readonly dialog: Dialog) {}

  handleNextPageRequest(page: AccidentsParams['page']): void {
    this.store.dispatch(DashboardActions.fetchAccidents({ params: { page } }));
  }

  handleRowClick(accident: AccidentsElement): void {
    this.dialog.open<void, DashboardCoreAccidentsDialogData>(DashboardCoreAccidentsDialogComponent, { data: { id: accident.id } });
  }

  handleExportItemClick(event: MouseEvent, id: string): void {
    event.stopPropagation();
    this.store.dispatch(DashboardActions.exportAccident({ id }));
  }

  handleExportItemKeyDown(id: string): void {
    const syntheticMouseEvent = {
      stopPropagation: () => {},
      preventDefault: () => {}
    } as MouseEvent;

    this.handleExportItemClick(syntheticMouseEvent, id);
  }
}
