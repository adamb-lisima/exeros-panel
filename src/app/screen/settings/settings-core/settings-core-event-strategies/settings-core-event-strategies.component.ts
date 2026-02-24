import { MatDialog } from '@angular/material/dialog';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { SettingsActions } from '../../settings.actions';
import { AccessGroup, EventStrategy, getAlarmTypeName } from '../../settings.model';
import { SettingsSelectors } from '../../settings.selectors';
import { EditEventStrategyData, SettingsCoreEventStrategiesCreateDialogComponent } from './settings-core-event-strategies-create-dialog/settings-core-event-strategies-create-dialog.component';
import { SettingsCoreEventStrategiesDeleteDialogComponent } from './settings-core-event-strategies-delete-dialog/settings-core-event-strategies-delete-dialog.component';
import { SettingsCoreEventStrategiesFleetStrategiesDialogComponent } from './settings-core-event-strategies-fleet-strategies-dialog/settings-core-event-strategies-fleet-strategies-dialog.component';

@Component({
  selector: 'app-settings-core-event-strategies',
  templateUrl: './settings-core-event-strategies.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreEventStrategiesComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  readonly accessGroup = AccessGroup;
  readonly perPage = 10;
  eventStrategiesResponse$ = this.store.select(SettingsSelectors.eventStrategiesResponse);
  loading$ = this.store.select(SettingsSelectors.eventStrategiesLoading);

  constructor(private readonly store: Store, private readonly dialog: MatDialog) {}

  ngOnInit(): void {
    this.store.dispatch(
      SettingsActions.fetchEventStrategiesResponse({
        params: {
          page: 1,
          per_page: this.perPage
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleCreateStrategyClick(): void {
    this.dialog.open<void, EditEventStrategyData>(SettingsCoreEventStrategiesCreateDialogComponent, {
      data: {
        type: 'create'
      }
    });
  }

  handleEditStrategyClick(strategy: EventStrategy): void {
    this.dialog.open<void, EditEventStrategyData>(SettingsCoreEventStrategiesCreateDialogComponent, {
      data: {
        type: 'edit',
        id: strategy.id
      }
    });
  }

  handleDeleteStrategyClick(strategy: EventStrategy): void {
    this.dialog.open<void, { id: number; strategy: string }>(SettingsCoreEventStrategiesDeleteDialogComponent, {
      data: {
        id: strategy.id,
        strategy: `Strategy for ${getAlarmTypeName(strategy.alarm_type_id)}`
      }
    });
  }

  onPageChange(page: number) {
    this.store.dispatch(
      SettingsActions.fetchEventStrategiesResponse({
        params: {
          page
        }
      })
    );
  }

  handleFleetStrategiesClick(): void {
    this.dialog.open<void, void>(SettingsCoreEventStrategiesFleetStrategiesDialogComponent);
  }
}
