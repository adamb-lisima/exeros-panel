import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AccessGroup } from '../../../../screen/settings/settings.model';
import { AccidentsMeta } from '../../../../service/http/accidents/accidents.model';

@Component({
  selector: 'app-accidents-tab-base',
  templateUrl: './accidents-tab-base.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccidentsTabBaseComponent {
  accidentsDownloaderAccess = AccessGroup.ACCIDENTS_REPORTS_DOWNLOADER;
  @Input() accidents: any[] | null = null;
  @Input() accidentsMeta: AccidentsMeta | null | undefined = null;
  @Input() accidentsLoading: boolean | null = false;
  @Input() showTitle = false;

  @Output() rowClick = new EventEmitter<any>();
  @Output() exportItem = new EventEmitter<{ event: MouseEvent; id: string }>();
  @Output() exportItemKeyDown = new EventEmitter<string>();
  @Output() nextPageRequest = new EventEmitter<number>();

  handleNextPageRequest(page: number): void {
    this.nextPageRequest.emit(page);
  }

  handleRowClick(vehicleCheck: any): void {
    this.rowClick.emit(vehicleCheck);
  }

  handleExportItemClick(event: MouseEvent, id: string): void {
    event.stopPropagation();
    this.exportItem.emit({ event, id });
  }

  handleExportItemKeyDown(id: string): void {
    this.exportItemKeyDown.emit(id);
  }
}
