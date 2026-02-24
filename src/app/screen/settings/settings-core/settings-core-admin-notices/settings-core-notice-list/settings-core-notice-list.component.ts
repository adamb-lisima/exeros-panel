import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InfotainmentsResponse } from '../../../settings.model';
import { SettingsCoreDeleteNoticeComponent } from '../settings-core-delete-notice/settings-core-delete-notice.component';
import { SettingsCoreNewNoticesComponent } from '../settings-core-new-notices/settings-core-new-notices.component';

@Component({
  selector: 'app-settings-core-notice-list',
  templateUrl: './settings-core-notice-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreNoticeListComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  @Input() data?: Observable<InfotainmentsResponse | undefined>;
  @Output() delete = new EventEmitter<number>();
  @Input() currentStatus: string | null = null;

  constructor(private readonly dialog: Dialog) {}

  editInfotainment(id: number): void {
    this.dialog.open(SettingsCoreNewNoticesComponent, {
      data: { id, readOnly: false }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  viewInfotainment(id: number): void {
    this.dialog.open(SettingsCoreNewNoticesComponent, {
      data: { id, readOnly: true }
    });
  }

  onDelete(id: number, title: string): void {
    const dialogRef = this.dialog.open(SettingsCoreDeleteNoticeComponent, {
      data: { id, title }
    });

    dialogRef.closed.pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result === true) {
        this.delete.emit(id);
      }
    });
  }

  getStatusTitle(): string {
    switch (this.currentStatus) {
      case 'completed':
        return 'Sent';
      case 'pending':
        return 'Planned';
      case 'draft':
        return 'Draft';
      default:
        return 'All notices';
    }
  }

  duplicateInfotainment(infotainment: any): void {
    const duplicateData = {
      title: `Copy of ${infotainment.title}`,
      content: infotainment.content,
      schedule_email: infotainment.status === 'pending',
      send_time: infotainment.send_time,
      start_hour: infotainment.start_hour,
      end_hour: infotainment.end_hour,
      isDuplicate: true
    };

    this.dialog.open(SettingsCoreNewNoticesComponent, {
      data: { duplicateData }
    });
  }
}
