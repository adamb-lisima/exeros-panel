import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ReportParams, ReportResponse } from '../../../settings.model';

@Component({
  selector: 'app-settings-core-reports-list',
  templateUrl: './settings-core-reports-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreReportsListComponent {
  @Output() createNewReport = new EventEmitter<void>();
  @Output() deleteReport = new EventEmitter<ReportParams>();
  @Output() editReport = new EventEmitter<ReportParams>();
  @Output() showReport = new EventEmitter<ReportParams>();

  @Input() data?: ReportResponse | null;
  @Input() status?: 'ACTIVE' | 'INACTIVE' | undefined;
  @Input() title?: string;

  handleDeleteReportClick(report: ReportParams): void {
    this.deleteReport.emit(report);
  }

  handleEditReportClick(report: ReportParams): void {
    this.editReport.emit(report);
  }

  handleNameClick(report: ReportParams): void {
    this.showReport.emit(report);
  }

  titleMap: { [key: string]: string } = {
    events: 'EVENT reports',
    distance: 'DISTANCE reports',
    driver_score: 'DRIVER_SCORE reports',
    events_active: 'ACTIVE EVENT reports',
    events_inactive: 'INACTIVE EVENT reports',
    distance_active: 'ACTIVE DISTANCE reports',
    distance_inactive: 'INACTIVE DISTANCE reports',
    driver_score_active: 'ACTIVE DRIVER SCORE reports',
    driver_score_inactive: 'INACTIVE DRIVER SCORE reports',
    default: 'All reports'
  };
}
