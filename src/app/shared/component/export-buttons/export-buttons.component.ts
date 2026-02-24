import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ExportType } from '../../../model/export-type.model';

@Component({
  selector: 'app-export-buttons',
  templateUrl: './export-buttons.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportButtonsComponent {
  @Input() containerClass: string = 'flex gap-2';

  @Output() export = new EventEmitter<ExportType>();

  handleExportClick(format: ExportType): void {
    this.export.emit(format);
  }

  handleExportKeyDown(format: ExportType): void {
    this.export.emit(format);
  }
}
