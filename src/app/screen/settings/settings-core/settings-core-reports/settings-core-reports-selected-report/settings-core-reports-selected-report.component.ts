import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Report, ReportItemResponse } from '../../../settings.model';

@Component({
  selector: 'app-settings-core-reports-selected-report',
  templateUrl: './settings-core-reports-selected-report.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreReportsSelectedReportComponent {
  @Input() data?: ReportItemResponse | null;
  @Input() report?: Report | null;
  @Output() editReport = new EventEmitter<Report>();

  handleEditReportClick() {
    this.editReport.emit(this.report!);
  }
}
