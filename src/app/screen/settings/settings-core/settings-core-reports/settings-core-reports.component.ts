import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { map, Subscription } from 'rxjs';
import { SettingsActions } from '../../settings.actions';
import { Report, ReportParams } from '../../settings.model';
import { SettingsSelectors } from '../../settings.selectors';
import { SettingsCoreReportsDeleteReportComponent } from './settings-core-reports-delete-report/settings-core-reports-delete-report.component';
import { SettingsCoreReportsNewReportComponent } from './settings-core-reports-new-report/settings-core-reports-new-report.component';

@Component({
  selector: 'app-settings-core-reports',
  templateUrl: './settings-core-reports.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreReportsComponent implements OnInit, OnDestroy {
  reportResponse$ = this.store.select(SettingsSelectors.reportResponse);
  perPage$ = this.store.select(SettingsSelectors.reportResponseParams).pipe(map(params => params.per_page));
  private sub?: Subscription;
  reportItemResponse$ = this.store.select(SettingsSelectors.reportItemResponse);
  selectedReport$ = this.store.select(SettingsSelectors.report);
  selectedReportId?: number;
  active: 'events' | 'distance' | 'driver_score' | 'events_active' | 'events_inactive' | 'distance_active' | 'distance_inactive' | 'driver_score_active' | 'driver_score_inactive' | undefined;

  constructor(private readonly store: Store, private readonly fb: FormBuilder, private readonly dialog: Dialog) {}

  ngOnInit(): void {
    this.store.dispatch(
      SettingsActions.fetchReportResponse({
        params: {
          page: 1
        }
      })
    );
    this.sub = new Subscription();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  handleCreateReportClick(): void {
    this.dialog.open<void>(SettingsCoreReportsNewReportComponent, {
      data: {}
    });
  }

  handleClick(status: 'events' | 'distance' | 'driver_score' | 'events_active' | 'events_inactive' | 'distance_active' | 'distance_inactive' | 'driver_score_active' | 'driver_score_inactive' | undefined) {
    this.active = status;
    this.selectedReportId = undefined;
    switch (status) {
      case 'events_active':
        this.store.dispatch(SettingsActions.fetchReportResponse({ params: { page: 1, report_type: 'EVENT', status: 'ACTIVE', per_page: 10 } }));
        break;
      case 'events_inactive':
        this.store.dispatch(SettingsActions.fetchReportResponse({ params: { page: 1, report_type: 'EVENT', status: 'INACTIVE', per_page: 10 } }));
        break;
      case 'distance_active':
        this.store.dispatch(SettingsActions.fetchReportResponse({ params: { page: 1, report_type: 'DISTANCE', status: 'ACTIVE', per_page: 10 } }));
        break;
      case 'distance_inactive':
        this.store.dispatch(SettingsActions.fetchReportResponse({ params: { page: 1, report_type: 'DISTANCE', status: 'INACTIVE', per_page: 10 } }));
        break;
      case 'driver_score_active':
        this.store.dispatch(SettingsActions.fetchReportResponse({ params: { page: 1, report_type: 'DRIVER_SCORE', status: 'ACTIVE', per_page: 10 } }));
        break;
      case 'driver_score_inactive':
        this.store.dispatch(SettingsActions.fetchReportResponse({ params: { page: 1, report_type: 'DRIVER_SCORE', status: 'INACTIVE', per_page: 10 } }));
        break;
      case 'distance':
        this.store.dispatch(SettingsActions.fetchReportResponse({ params: { page: 1, report_type: 'DISTANCE', status: undefined, per_page: 10 } }));
        break;
      case 'events':
        this.store.dispatch(SettingsActions.fetchReportResponse({ params: { page: 1, report_type: 'EVENT', status: undefined, per_page: 10 } }));
        break;
      case 'driver_score':
        this.store.dispatch(SettingsActions.fetchReportResponse({ params: { page: 1, report_type: 'DRIVER_SCORE', status: undefined, per_page: 10 } }));
        break;
      default:
        this.store.dispatch(SettingsActions.fetchReportResponse({ params: { page: 1, per_page: 10, report_type: undefined, status: undefined } }));
    }
  }

  handleDeleteReportClick(report: ReportParams | Report): void {
    this.dialog.open<void, { id: number; name: string }>(SettingsCoreReportsDeleteReportComponent, {
      data: {
        id: report.id,
        name: report.name!
      }
    });
    this.selectedReportId = undefined;
  }

  handleClickSelectReport(report: ReportParams): void {
    this.selectedReportId = report.id;

    this.store.dispatch(SettingsActions.fetchReportItemResponse({ params: { page: 1, automated_report_id: report.id } }));
    this.store.dispatch(SettingsActions.fetchReport({ id: report.id! }));
  }

  handleEditReportClick(report: ReportParams | Report): void {
    this.dialog.open<void>(SettingsCoreReportsNewReportComponent, {
      data: {
        id: report.id,
        name: report.name,
        type: report.type,
        receivers: report.receivers,
        fleet_ids: report.fleet_ids,
        status: report.status
      }
    });
  }

  onPageChange(page: number) {
    this.store.dispatch(
      SettingsActions.fetchReportResponse({
        params: {
          page
        }
      })
    );
  }

  onPageChangeSelect(page: number) {
    this.store.dispatch(
      SettingsActions.fetchReportItemResponse({
        params: {
          page
        }
      })
    );
  }
}
