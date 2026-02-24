import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { TicketService } from '../../../service/http/tickets/ticket.service';

interface DialogData {
  vehicleId?: number;
  isVehicleIssue?: boolean;
  vehicleRegistrationPlate?: string;
}

@Component({
  selector: 'app-report-issue-modal',
  templateUrl: './report-issue-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportIssueModalComponent implements OnDestroy {
  subject = '';
  description = '';
  priority = 2;

  isSubmitting = false;
  selectedFiles: File[] = [];

  private readonly destroy$ = new Subject<void>();
  private readonly subscriptions = new Subscription();

  priorities = [
    { value: 1, label: 'Low' },
    { value: 2, label: 'Medium' },
    { value: 3, label: 'High' },
    { value: 4, label: 'Urgent' }
  ];

  constructor(private readonly ticketService: TicketService, public dialogRef: DialogRef<any>, @Inject(DIALOG_DATA) public data: DialogData) {
    if (this.data?.isVehicleIssue) {
      const vehicleInfo = this.data.vehicleId ? ` (Vehicle registration plate: ${this.data.vehicleRegistrationPlate})` : '';
      this.subject = `Vehicle issue report ${vehicleInfo}`;
      this.description = `I would like to report an issue with a vehicle ${vehicleInfo}.\n\nIssue details:`;
    }
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].size <= 10 * 1024 * 1024) {
          this.selectedFiles.push(files[i]);
        }
      }
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  onSubmit(): void {
    if (!this.subject || !this.description) {
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('subject', this.subject);
    formData.append('description', this.description);
    formData.append('priority', this.priority.toString());

    if (this.data?.vehicleId && this.data.isVehicleIssue) {
      formData.append('vehicle_id', this.data.vehicleId.toString());
    }

    this.selectedFiles.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file);
    });

    const subscription = this.ticketService
      .createTicket(formData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: () => {
          this.dialogRef.close({ success: true });
        },
        error: (error: unknown) => {
          console.error('Error submitting issue:', error);
        }
      });

    this.subscriptions.add(subscription);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.unsubscribe();
  }
}
