import { AsyncPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { NgModule } from '@angular/core';
import { ExportButtonsComponent } from './export-buttons.component';

@NgModule({
  exports: [ExportButtonsComponent],
  imports: [AsyncPipe, NgForOf, NgIf, NgClass],
  declarations: [ExportButtonsComponent]
})
export class ExportButtonsModule {}
