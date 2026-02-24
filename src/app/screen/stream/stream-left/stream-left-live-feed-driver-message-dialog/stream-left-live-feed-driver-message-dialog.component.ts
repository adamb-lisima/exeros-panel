import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LiveFeed } from '../../../../service/http/live-feeds/live-feeds.model';
import { AuthSelectors } from '../../../../store/auth/auth.selectors';
import { waitOnceForAction } from '../../../../util/operators';
import { StreamActions } from '../../stream.actions';
import { CreateMessageBody } from '../../stream.model';

export interface StreamLeftLiveFeedDriverMessageData {
  driver: NonNullable<LiveFeed['driver']>;
}

@Component({
  templateUrl: './stream-left-live-feed-driver-message-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StreamLeftLiveFeedDriverMessageDialogComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  loggedInUser$ = this.store.select(AuthSelectors.loggedInUser);
  bodyGroup = this.fb.group<Nullable<CreateMessageBody>>({
    message_type: 'DRIVER',
    receiver_id: this.data.driver.id,
    message: ''
  });

  constructor(private readonly store: Store, private readonly actions$: Actions, private readonly fb: FormBuilder, private readonly dialogRef: DialogRef, @Inject(DIALOG_DATA) public data: StreamLeftLiveFeedDriverMessageData) {}

  handleCloseClick(): void {
    this.dialogRef.close();
  }

  handleSendClick(): void {
    if (this.bodyGroup.dirty) {
      this.store.dispatch(StreamActions.createMessage({ body: this.bodyGroup.value as CreateMessageBody }));
      this.actions$
        .pipe(
          waitOnceForAction([StreamActions.createMessageSuccess]),
          takeUntil(this.destroy$),

          tap(() => this.dialogRef.close())
        )
        .subscribe();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
