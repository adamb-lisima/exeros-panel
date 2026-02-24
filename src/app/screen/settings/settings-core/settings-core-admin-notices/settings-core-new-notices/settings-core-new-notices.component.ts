import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { filter, Subject, Subscription, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { firstNonNullish, waitOnceForAction } from '../../../../../util/operators';
import { SettingsActions } from '../../../settings.actions';
import { AccessGroup, CreateInfotainmentBody } from '../../../settings.model';
import { SettingsSelectors } from '../../../settings.selectors';

export interface EditInfotainmentData {
  id?: number;
  readOnly?: boolean;
  duplicateData?: {
    title: string;
    content: string;
    schedule_email: boolean;
    send_time: string;
    start_hour?: string;
    end_hour?: string;
  };
}

@Component({
  selector: 'app-settings-core-new-notices',
  templateUrl: './settings-core-new-notices.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreNewNoticesComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly sub?: Subscription;

  form = this.fb.group({
    title: ['', Validators.required],
    content: [this.getDefaultTemplate()],
    schedule_email: [false],
    send_time: [this.formatCurrentDateTime()],
    status: ['draft'],
    start_hour: [this.formatCurrentDateTime()],
    end_hour: [this.formatCurrentDateTime()]
  });

  private getDefaultTemplate(): string {
    return `We would like to inform you that the platform will undergo scheduled maintenance on %day%, from %start_hour% to %end_hour% AM (UTC). During this time, the platform will be temporarily unavailable.
We apologize for any inconvenience caused and appreciate your understanding.
If you have any questions or concerns, please contact our support team at support@exeros-tech.co.uk.`;
  }

  title = 'Create new notice';
  button = '';
  readOnly: boolean = false;
  protected readonly accessGroup = AccessGroup;

  constructor(@Inject(DIALOG_DATA) public data: EditInfotainmentData | undefined, private readonly dialogRef: DialogRef, private readonly cdr: ChangeDetectorRef, private readonly store: Store, private readonly actions$: Actions, private readonly fb: FormBuilder) {
    if (this.data?.id == undefined) {
      this.title = 'Create new notice';
      this.button = 'Send';
      this.readOnly = false;
    } else if (this.data?.readOnly) {
      this.title = 'View notice';
      this.button = 'Close';
      this.readOnly = true;
    } else {
      this.title = 'Edit notice';
      this.button = 'Update';
      this.readOnly = false;
    }
  }

  ngOnInit(): void {
    this.form
      .get('schedule_email')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(checked => {
        const sendTimeControl = this.form.get('send_time');
        if (checked) {
          sendTimeControl?.enable();
        } else {
          sendTimeControl?.disable();
        }
      });

    if (!this.form.get('schedule_email')?.value) {
      this.form.get('send_time')?.disable();
    }

    if (this.data?.id != undefined) {
      this.store.dispatch(SettingsActions.fetchInfotainment({ id: this.data.id }));

      this.actions$
        .pipe(
          waitOnceForAction([SettingsActions.fetchInfotainmentSuccess]),
          filter(() => !!this.data?.id),
          tap(() => {
            this.store
              .select(SettingsSelectors.infotainment)
              .pipe(firstNonNullish(), takeUntil(this.destroy$))
              .subscribe(infotainment => {
                const defaultTime = this.formatCurrentDateTime();
                const start_hour = infotainment.start_hour && infotainment.start_hour.trim() !== '' ? infotainment.start_hour : defaultTime;
                const end_hour = infotainment.end_hour && infotainment.end_hour.trim() !== '' ? infotainment.end_hour : defaultTime;

                const send_time = infotainment.send_time && infotainment.send_time.trim() !== '' ? infotainment.send_time : defaultTime;

                this.form.patchValue({
                  title: infotainment.title,
                  content: infotainment.content,
                  schedule_email: infotainment.status === 'pending',
                  send_time: send_time,
                  status: infotainment.status,
                  start_hour: start_hour,
                  end_hour: end_hour
                });

                if (this.readOnly || infotainment.status === 'completed') {
                  this.form.disable();
                  this.readOnly = true;
                } else {
                  if (!this.form.get('schedule_email')?.value) {
                    this.form.get('send_time')?.disable();
                  }
                }

                setTimeout(() => {
                  this.cdr.detectChanges();
                }, 0);
              });
          }),
          takeUntil(this.destroy$)
        )
        .subscribe();
    }

    if (this.data?.duplicateData) {
      this.title = 'Create new notice';
      this.button = 'Send notification';
      this.readOnly = false;

      this.form.patchValue({
        title: this.data.duplicateData.title,
        content: this.data.duplicateData.content,
        schedule_email: this.data.duplicateData.schedule_email,
        send_time: this.data.duplicateData.send_time,
        status: 'draft',
        start_hour: this.data.duplicateData.start_hour ?? '',
        end_hour: this.data.duplicateData.end_hour ?? ''
      });

      if (this.form.get('schedule_email')?.value) {
        this.form.get('send_time')?.enable();
      } else {
        this.form.get('send_time')?.disable();
      }

      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  handleSaveClick(): void {
    this.markFormAsTouched();
    if (this.readOnly) {
      this.dialogRef.close();
      return;
    }

    const formValue = this.form.getRawValue();
    const currentStatus = formValue.status;

    const body = this.getBody();

    if (currentStatus === 'draft') {
      if (formValue.schedule_email) {
        (body as any).status = 'pending';
      } else {
        (body as any).status = 'completed';
      }
    }

    if (this.data?.id == undefined) {
      this.store.dispatch(SettingsActions.createInfotainment({ body }));

      this.actions$
        .pipe(
          waitOnceForAction([SettingsActions.createInfotainmentSuccess]),
          tap(() => {
            this.dialogRef.close();
            this.store.dispatch(SettingsActions.fetchInfotainments({ params: {} }));
          }),
          takeUntil(this.destroy$)
        )
        .subscribe();
    } else {
      this.store.dispatch(SettingsActions.updateInfotainment({ id: this.data.id, body }));

      this.actions$
        .pipe(
          waitOnceForAction([SettingsActions.updateInfotainmentSuccess]),
          tap(() => {
            this.dialogRef.close();
            this.store.dispatch(SettingsActions.fetchInfotainments({ params: {} }));
          }),
          takeUntil(this.destroy$)
        )
        .subscribe();
    }
  }

  saveDraft(): void {
    if (this.readOnly) return;
    const formValue = this.form.getRawValue();

    let sendTime: string;
    if (typeof formValue.send_time === 'string' && formValue.send_time.trim() !== '') {
      sendTime = formValue.send_time;
    } else {
      sendTime = this.formatCurrentDateTime();
    }

    const startHour = typeof formValue.start_hour === 'string' && formValue.start_hour.trim() !== '' ? formValue.start_hour : this.formatCurrentDateTime();

    const endHour = typeof formValue.end_hour === 'string' && formValue.end_hour.trim() !== '' ? formValue.end_hour : this.formatCurrentDateTime();

    const body: CreateInfotainmentBody = {
      title: formValue.title ?? '',
      content: formValue.content ?? '',
      schedule_email: formValue.schedule_email ?? false,
      send_time: sendTime,
      start_hour: startHour,
      end_hour: endHour
    };

    (body as any).status = 'draft';

    if (this.data?.id == undefined) {
      this.store.dispatch(SettingsActions.createInfotainment({ body }));
    } else {
      this.store.dispatch(SettingsActions.updateInfotainment({ id: this.data.id, body }));
    }

    this.actions$
      .pipe(
        waitOnceForAction([SettingsActions.createInfotainmentSuccess, SettingsActions.updateInfotainmentSuccess]),
        tap(() => {
          this.dialogRef.close();
          this.store.dispatch(SettingsActions.fetchInfotainments({ params: {} }));
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private getBody(): CreateInfotainmentBody {
    const formValue = this.form.getRawValue();

    const sendTime = typeof formValue.send_time === 'string' ? formValue.send_time : this.formatCurrentDateTime();
    const startHour = typeof formValue.start_hour === 'string' ? formValue.start_hour : '';
    const endHour = typeof formValue.end_hour === 'string' ? formValue.end_hour : '';

    const body: CreateInfotainmentBody = {
      title: formValue.title ?? '',
      content: formValue.content ?? this.getDefaultTemplate(),
      schedule_email: formValue.schedule_email ?? false,
      send_time: sendTime,
      start_hour: startHour,
      end_hour: endHour
    };

    if (formValue.schedule_email) {
      (body as any).status = 'pending';
    } else {
      (body as any).status = 'completed';
    }
    return body;
  }

  private formatCurrentDateTime(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  private markFormAsTouched() {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
    this.cdr.detectChanges();
  }
}
