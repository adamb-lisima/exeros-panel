import { DialogModule } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from '../button/button.module';
import { DialogContainerModule } from '../dialog/dialog-container/dialog-container.module';
import { ReportIssueModalComponent } from './report-issue-modal.component';

@NgModule({
  declarations: [ReportIssueModalComponent],
  imports: [ButtonModule, CommonModule, FormsModule, DialogModule, DialogContainerModule],
  exports: [ReportIssueModalComponent]
})
export class ReportIssueModalModule {}
