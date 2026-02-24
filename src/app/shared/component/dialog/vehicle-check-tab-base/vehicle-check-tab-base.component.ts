import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AccessGroup } from '../../../../screen/settings/settings.model';

@Component({
  selector: 'app-vehicle-check-tab-base',
  templateUrl: './vehicle-check-tab-base.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleCheckTabBaseComponent {
  vehicleCheckDownloader = AccessGroup.VEHICLES_CHECKS_REPORTS_DOWNLOADER;
  vehicleCheckViewer = AccessGroup.VEHICLES_CHECKS_REPORTS_VIEWER;

  @Input() vehicleChecks: any[] | null = null;
  @Input() vehicleChecksLoading: boolean | null = false;
  @Input() statusOptions: any[] = [];
  @Input() formParams: any;

  @Input() showTitle = false;

  @Output() rowClick = new EventEmitter<any>();
  @Output() exportItem = new EventEmitter<{ event: MouseEvent; id: number }>();
  @Output() exportItemKeyDown = new EventEmitter<number>();

  handleRowClick(vehicleCheck: any): void {
    this.rowClick.emit(vehicleCheck);
  }

  handleExportItemClick(event: MouseEvent, id: number): void {
    event.stopPropagation();
    this.exportItem.emit({ event, id });
  }

  handleExportItemKeyDown(id: number): void {
    this.exportItemKeyDown.emit(id);
  }
}
