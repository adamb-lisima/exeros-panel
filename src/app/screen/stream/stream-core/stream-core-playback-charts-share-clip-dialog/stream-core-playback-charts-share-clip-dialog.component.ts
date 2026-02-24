import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { catchError, combineLatest, filter, first, map, Observable, of, Subject, Subscription, switchMap, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import DateConst from '../../../../const/date';
import RouteConst from '../../../../const/route';
import { SelectControl } from '../../../../shared/component/control/select-control/select-control.model';
import { SharedClipCreateBody } from '../../../../store/download-task/download-task.model';
import { firstNonNullish, waitOnceForAction } from '../../../../util/operators';
import { AccessGroup } from '../../../settings/settings.model';
import { StreamActions } from '../../stream.actions';
import { CameraInfo } from '../../stream.model';
import { StreamSelectors } from '../../stream.selectors';
import { StreamCorePlaybackChartsDownloadClipDialogData } from '../stream-core-playback-charts-download-clip-dialog/stream-core-playback-charts-download-clip-dialog.model';

@Component({
  selector: 'app-stream-core-playback-charts-share-clip-dialog',
  templateUrl: './stream-core-playback-charts-share-clip-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StreamCorePlaybackChartsShareClipDialogComponent implements OnInit {
  streamType$ = this.store.select(StreamSelectors.playbackStreamType);
  playback$ = this.store.select(StreamSelectors.playback).pipe(firstNonNullish());
  cameras$: Observable<CameraInfo[]> = this.playback$.pipe(map(playback => playback.cameras ?? []));
  contactOptions: any[] = [];
  sharedClipsAccessType$: Observable<string> = this.playback$.pipe(map(playback => playback.shared_clips_settings.access_type));
  sharedClipsContacts$: Observable<{ name: string; email: string }[]> = this.playback$.pipe(map(playback => playback?.shared_clips_settings?.contacts ?? []));

  getContactOptions(contacts: any[]) {
    if (!Array.isArray(contacts)) return [];
    return contacts.map(contact => ({
      label: contact.name + ' ' + contact.email,
      value: contact.email
    }));
  }

  private readonly destroy$ = new Subject<void>();
  private subscriptions = new Subscription();

  selectedDuration: number = 30;
  selectedStream: 'main_stream' | 'sub_stream' = 'sub_stream';
  bodyGroup = this.fb.group<
    Nullable<{
      name: string;
      from: string;
      to: string;
      stream: 'main_stream' | 'sub_stream';
      is_password_required: boolean;
      is_send_emails: string;
      selectedContacts: string[];
      manualEmails: string;
      password: string;
      expires_after_days: number;
    }>
  >({
    name: '',
    from: DateTime.fromJSDate(this.data.startTime).toFormat(DateConst.timeFormat),
    to: '',
    stream: 'sub_stream',
    is_password_required: false,
    is_send_emails: 'false',
    selectedContacts: [],
    manualEmails: '',
    password: '',
    expires_after_days: 7
  });

  selectedCameras: CameraInfo[] = [];

  submitError: string | null = null;
  sharedLink: string | null = null;
  linkCopied = false;
  passwordGenerated = false;
  private _shouldOpenInNewWindow = false;
  sharedUrl: string | null = null;
  isPasswordConfirmed = false;

  ngOnInit() {
    const passwordSub = this.bodyGroup.controls.is_password_required.valueChanges.pipe(takeUntil(this.destroy$)).subscribe({
      next: value => {
        if (value === false) {
          this.bodyGroup.patchValue({ password: '' }, { emitEvent: false });
          this.passwordGenerated = false;
        }
      },
      error: (error: unknown) => {
        console.error('Error in is_password_required valueChanges:', error);
      }
    });

    this.subscriptions.add(passwordSub);

    const contactsSub = this.sharedClipsContacts$.pipe(takeUntil(this.destroy$)).subscribe({
      next: contacts => {
        this.contactOptions = contacts ? this.getContactOptions(contacts) : [];
      },
      error: (error: unknown) => {
        console.error('Error in sharedClipsContacts$ subscription:', error);
      }
    });

    this.subscriptions.add(contactsSub);
  }

  handleCloseClick(): void {
    this.dialogRef.close();
  }

  constructor(@Inject(DIALOG_DATA) public data: StreamCorePlaybackChartsDownloadClipDialogData, private readonly dialogRef: DialogRef, private readonly store: Store, private readonly fb: FormBuilder, private readonly actions$: Actions, private readonly cdr: ChangeDetectorRef) {
    const streamTypeSub = this.store
      .select(StreamSelectors.playbackStreamType)
      .pipe(
        first(),
        tap(streamType => {
          const initialStream = streamType === '1' ? 'main_stream' : 'sub_stream';
          this.selectedStream = initialStream;
          this.bodyGroup.patchValue({ stream: initialStream });
        }),
        catchError((error: unknown) => {
          console.error('Error getting initial stream type:', error);
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        error: (error: unknown) => {
          console.error('Error in initial stream type subscription:', error);
        }
      });

    this.subscriptions.add(streamTypeSub);

    const streamUpdateSub = this.streamType$
      .pipe(
        tap(streamType => {
          this.selectedStream = streamType === '1' ? 'main_stream' : 'sub_stream';
          this.bodyGroup?.patchValue({ stream: this.selectedStream }, { emitEvent: false });
        }),
        catchError((error: unknown) => {
          console.error('Error updating stream type:', error);
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        error: (error: unknown) => {
          console.error('Error in stream type update subscription:', error);
        }
      });

    this.subscriptions.add(streamUpdateSub);
  }

  streamOptions: SelectControl<'main_stream' | 'sub_stream'>[] = [
    { label: 'High quality', value: 'main_stream' },
    { label: 'Standard quality', value: 'sub_stream' }
  ];

  clipDurations = [
    { label: '10s', value: 10 },
    { label: '30s', value: 30 },
    { label: '1m', value: 60 },
    { label: '3m', value: 180 },
    { label: '5m', value: 300 }
  ];

  trackByCamera(index: number, camera: CameraInfo): number {
    return camera.id;
  }

  toggleSelection(camera: CameraInfo): void {
    const index = this.selectedCameras.findIndex(selectedCamera => selectedCamera.id === camera.id);
    if (index === -1) {
      this.selectedCameras.push(camera);
    } else {
      this.selectedCameras.splice(index, 1);
    }
  }

  isSelected(camera: CameraInfo): boolean {
    return this.selectedCameras.some(selectedCamera => selectedCamera.id === camera.id);
  }

  updateDuration(duration: number): void {
    this.selectedDuration = duration;
  }

  settingsRedirect() {
    localStorage.setItem('settingsTab', 'shared-clips-emails');
    const url = `/#/${RouteConst.settings}`;
    window.open(url, '_blank');
  }

  togglePassword(): void {
    const currentValue = this.bodyGroup.controls.is_password_required.value;
    const newValue = !currentValue;

    this.bodyGroup.patchValue(
      {
        is_password_required: newValue
      },
      { emitEvent: true }
    );

    if (!newValue) {
      this.bodyGroup.patchValue({ password: '' });
      this.passwordGenerated = false;
    }
  }

  generatePassword(): void {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    this.bodyGroup.patchValue({ password });
    this.passwordGenerated = true;
  }

  private getCombinedEmails(): string {
    const selectedContacts = this.bodyGroup.controls.selectedContacts.value ?? [];
    const manualEmails = this.bodyGroup.controls.manualEmails.value ?? '';

    const manualEmailsArray = manualEmails
      .split(',')
      .map(email => email.trim())
      .filter(email => email);

    const allEmails = [...selectedContacts, ...manualEmailsArray];
    const uniqueEmails = [...new Set(allEmails)];

    return uniqueEmails.join(', ');
  }

  private createSharedClip(sendEmails: boolean = false): void {
    if (!this.bodyGroup.valid || this.selectedCameras.length === 0) {
      return;
    }

    this.submitError = null;
    this.sharedLink = null;
    this.linkCopied = false;
    this._shouldOpenInNewWindow = sendEmails;

    const { name, from, stream = 'sub_stream' } = this.bodyGroup.value;
    const defaultStartTime = DateTime.fromJSDate(this.data.startTime);

    const startDateTime = from
      ? DateTime.fromFormat(from, DateConst.timeFormat).set({
          year: defaultStartTime.year,
          month: defaultStartTime.month,
          day: defaultStartTime.day
        })
      : defaultStartTime;

    const endDateTime = startDateTime.plus({ seconds: this.selectedDuration });

    const createSub = combineLatest([this.store.select(StreamSelectors.playback).pipe(firstNonNullish())])
      .pipe(
        first(),
        filter(([playback]) => !!playback),
        tap(([playback]) => {
          const channelsMap = new Map(playback!.cameras!.map(camera => [camera.name, camera.id]));
          const channels = this.selectedCameras.map(camera => channelsMap.get(camera.name)).filter((channel): channel is number => channel !== undefined);

          if (channels.length > 0) {
            const interfaceBody: SharedClipCreateBody = {
              name: name!,
              channels,
              from: startDateTime.toFormat(DateConst.serverDateTimeFormat),
              to: endDateTime.toFormat(DateConst.serverDateTimeFormat),
              stream: stream!,
              is_password_required: String(this.bodyGroup.controls.is_password_required.value) === 'true' ? 'true' : 'false',
              is_send_emails: sendEmails ? 'true' : 'false',
              expires_after_days: this.bodyGroup.controls.expires_after_days.value!
            };

            const combinedEmails = this.getCombinedEmails();
            if (combinedEmails && combinedEmails.length > 0) {
              interfaceBody.emails = combinedEmails;
            }

            if (this.isPasswordRequired) {
              const currentPassword = this.bodyGroup.controls.password.value;
              interfaceBody.password = currentPassword ?? '';
            }

            const apiBody = {
              ...interfaceBody,
              stream: stream === 'main_stream' ? 1 : 0,
              send_emails: sendEmails ? 'true' : 'false'
            };

            this.store.dispatch(
              StreamActions.sharedClip({
                vehicleId: playback.id,
                body: apiBody as any
              })
            );
          }
        }),
        switchMap(() =>
          this.actions$.pipe(
            waitOnceForAction([StreamActions.sharedClipSuccess]),
            tap(() => {
              this.cdr.markForCheck();
              this.dialogRef.close();
            })
          )
        ),
        catchError((error: unknown) => {
          console.error('Error creating shared clip:', error);
          this.submitError = 'Failed to create shared clip';
          this.cdr.markForCheck();
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        error: (error: unknown) => {
          console.error('Error in createSharedClip subscription:', error);
          this.submitError = 'Error creating shared clip';
          this.cdr.markForCheck();
        }
      });

    this.subscriptions.add(createSub);
  }

  get isPasswordRequired(): boolean {
    return !!this.bodyGroup.controls.is_password_required.value;
  }

  handleCopyLink(): void {
    if (!this.bodyGroup.valid || this.selectedCameras.length === 0) {
      return;
    }

    this.submitError = null;
    this.linkCopied = false;
    this.actions$.pipe(ofType(StreamActions.sharedClipSuccess), first(), takeUntil(this.destroy$)).subscribe({
      next: action => {
        let url: string | null = null;

        if (Array.isArray(action.response)) {
          if (action.response.length > 0 && action.response[0]?.url) {
            url = action.response[0].url;
          }
        } else {
          const response = action.response as { data?: { shared_clip?: { url?: string } } };
          if (response?.data?.shared_clip?.url) {
            url = response.data.shared_clip.url;
          }
        }

        if (url) {
          try {
            this.sharedUrl = url;

            const tempInput = document.createElement('input');
            tempInput.value = url;
            document.body.appendChild(tempInput);
            tempInput.select();

            const success = document.execCommand('copy');
            document.body.removeChild(tempInput);

            if (success) {
              this.linkCopied = true;
              this.cdr.markForCheck();

              setTimeout(() => {
                this.linkCopied = false;
                this.cdr.markForCheck();
              }, 3000);
            } else {
              this.submitError = 'Failed to copy URL';
              this.cdr.markForCheck();
            }
          } catch (err) {
            this.submitError = 'Error copying URL';
            this.cdr.markForCheck();
          }
        } else {
          this.submitError = 'No URL in response';
          this.cdr.markForCheck();
        }
      },
      error: () => {
        this.submitError = 'Failed to create share link';
        this.cdr.markForCheck();
      }
    });
    const { name, from, stream = 'sub_stream' } = this.bodyGroup.value;
    const defaultStartTime = DateTime.fromJSDate(this.data.startTime);

    const startDateTime = from
      ? DateTime.fromFormat(from, DateConst.timeFormat).set({
          year: defaultStartTime.year,
          month: defaultStartTime.month,
          day: defaultStartTime.day
        })
      : defaultStartTime;

    const endDateTime = startDateTime.plus({ seconds: this.selectedDuration });

    const playSub = this.playback$.pipe(first(), takeUntil(this.destroy$)).subscribe({
      next: playback => {
        const channelsMap = new Map((playback.cameras ?? []).map(camera => [camera.name, camera.id]));

        const channels = this.selectedCameras.map(camera => channelsMap.get(camera.name)).filter((channel): channel is number => channel !== undefined);

        if (channels.length > 0) {
          const interfaceBody: SharedClipCreateBody = {
            name: name!,
            channels,
            from: startDateTime.toFormat(DateConst.serverDateTimeFormat),
            to: endDateTime.toFormat(DateConst.serverDateTimeFormat),
            stream: stream!,
            is_password_required: String(this.bodyGroup.controls.is_password_required.value) === 'true' ? 'true' : 'false',
            is_send_emails: 'false',
            expires_after_days: this.bodyGroup.controls.expires_after_days.value!
          };

          const combinedEmails = this.getCombinedEmails();
          if (combinedEmails && combinedEmails.length > 0) {
            interfaceBody.emails = combinedEmails;
          }

          if (this.isPasswordRequired) {
            const currentPassword = this.bodyGroup.controls.password.value;
            interfaceBody.password = currentPassword ?? '';
          }

          const apiBody = {
            ...interfaceBody,
            stream: stream === 'main_stream' ? 1 : 0,
            send_emails: 'false'
          };

          this.store.dispatch(
            StreamActions.sharedClip({
              vehicleId: playback.id,
              body: apiBody as any
            })
          );
        } else {
          this.submitError = 'No channels selected';
          this.cdr.markForCheck();
        }
      },
      error: (error: unknown) => {
        console.error('Error in playback subscription:', error);
        this.submitError = 'Error processing request';
        this.cdr.markForCheck();
      }
    });

    this.subscriptions.add(playSub);
  }

  handleSendInvitation(): void {
    this.createSharedClip(true);
  }

  confirmPassword() {
    this.isPasswordConfirmed = !this.isPasswordConfirmed;
  }

  protected readonly accessGroup = AccessGroup;
}
