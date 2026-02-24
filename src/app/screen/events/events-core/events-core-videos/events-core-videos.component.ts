import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { skip, Subject, take, timeout } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { ReviewConfirmComponent, ReviewConfirmData } from 'src/app/shared/component/dialog/review-confirm/review-confirm.component';
import { ReasonRejectDialogComponent, ReasonRejectDialogData, ReasonRejectDialogResult } from '../../../../shared/component/dialog/reason-reject-dialog/reason-reject-dialog.component';
import { AuthSelectors } from '../../../../store/auth/auth.selectors';
import { AccessGroup } from '../../../settings/settings.model';
import { EventsActions } from '../../events.actions';
import { EventsSelectors } from '../../events.selectors';

@Component({
  selector: 'app-events-core-videos',
  templateUrl: './events-core-videos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsCoreVideosComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  mode$ = this.store.select(EventsSelectors.mode);
  event$ = this.store.select(EventsSelectors.event);
  userPermissions$ = this.store.select(AuthSelectors.loggedInUser).pipe(map(user => user?.access_groups ?? []));
  eventData: string = '{}';
  modeString: string = 'camera';
  permissionsString: string = '[]';
  accessGroup = AccessGroup;

  @ViewChild('eventsVideo') eventsVideoRef!: ElementRef;

  private readonly videoCurrentTimeChangeHandler: any;
  private readonly acceptDriverReviewHandler: any;
  private readonly rejectDriverReviewHandler: any;
  private readonly openReviewConfirmDialogHandler: any;
  private readonly openReasonRejectDialogHandler: any;

  constructor(private readonly store: Store, private readonly dialog: Dialog, private readonly cdr: ChangeDetectorRef) {
    this.videoCurrentTimeChangeHandler = this.handleVideoCurrentTimeChange.bind(this);
    this.acceptDriverReviewHandler = this.handleAcceptDriverReview.bind(this);
    this.rejectDriverReviewHandler = this.handleRejectDriverReview.bind(this);
    this.openReviewConfirmDialogHandler = this.handleOpenReviewConfirmDialog.bind(this);
    this.openReasonRejectDialogHandler = this.handleOpenReasonRejectDialog.bind(this);
  }

  ngOnInit(): void {
    this.loadVueComponent();

    this.event$.pipe(takeUntil(this.destroy$)).subscribe(event => {
      if (event) {
        this.eventData = JSON.stringify(event);
        this.cdr.detectChanges();
      }
    });

    this.mode$.pipe(takeUntil(this.destroy$)).subscribe(mode => {
      this.modeString = mode ?? 'camera';
      this.cdr.detectChanges();
    });

    this.userPermissions$.pipe(takeUntil(this.destroy$)).subscribe(permissions => {
      if (permissions) {
        this.permissionsString = JSON.stringify(permissions);
        this.cdr.detectChanges();
      }
    });

    window.addEventListener('video-current-time-change', this.videoCurrentTimeChangeHandler);
    window.addEventListener('accept-driver-review', this.acceptDriverReviewHandler);
    window.addEventListener('reject-driver-review', this.rejectDriverReviewHandler);
    window.addEventListener('open-review-confirm-dialog', this.openReviewConfirmDialogHandler);
    window.addEventListener('open-reason-reject-dialog', this.openReasonRejectDialogHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('video-current-time-change', this.videoCurrentTimeChangeHandler);
    window.removeEventListener('accept-driver-review', this.acceptDriverReviewHandler);
    window.removeEventListener('reject-driver-review', this.rejectDriverReviewHandler);
    window.removeEventListener('open-review-confirm-dialog', this.openReviewConfirmDialogHandler);
    window.removeEventListener('open-reason-reject-dialog', this.openReasonRejectDialogHandler);

    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadVueComponent(): void {
    if (!customElements.get('events-video')) {
      const script = document.createElement('script');
      script.src = 'assets/vue-widget.js';
      script.type = 'module';
      document.head.appendChild(script);
    }
  }

  handleVideoCurrentTimeChange(event: CustomEvent): void {
    if (!event.detail) return;

    const { videoCurrentTime } = event.detail;

    this.store.dispatch(
      EventsActions.setVideoCurrentTime({
        videoCurrentTime: videoCurrentTime
      })
    );
  }

  handleAcceptDriverReview(event: CustomEvent): void {
    if (!event.detail) return;

    const { reviewId, onComplete } = event.detail;

    const subscription = this.store
      .select(EventsSelectors.event)
      .pipe(skip(1), take(1), timeout(5000), takeUntil(this.destroy$))
      .subscribe({
        next: updatedEvent => {
          if (typeof onComplete === 'function') {
            onComplete(true);
          }
        }
      });

    this.store.dispatch(
      EventsActions.acceptDriverReview({
        reviewId: reviewId
      })
    );

    setTimeout(() => {
      if (subscription) {
        subscription.unsubscribe();
      }
    }, 5000);
  }

  handleRejectDriverReview(event: CustomEvent): void {
    if (!event.detail) return;

    const { reviewId, reason } = event.detail;

    this.store.dispatch(
      EventsActions.rejectDriverReview({
        reviewId: reviewId,
        reason: reason
      })
    );
  }

  handleOpenReviewConfirmDialog(event: CustomEvent): void {
    if (!event.detail) return;

    const { driverReview, eventId, onResult } = event.detail;

    this.dialog
      .open<boolean, ReviewConfirmData>(ReviewConfirmComponent, {
        panelClass: 'review-dialog',
        data: {
          driverReview: driverReview,
          eventId: eventId
        }
      })
      .closed.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          if (typeof onResult === 'function') {
            onResult(result);
          }
        },
        error: error => {
          console.error('Error in dialog closed subscription:', error);
        }
      });
  }

  handleOpenReasonRejectDialog(event: CustomEvent): void {
    if (!event.detail) return;

    const { driverReview, eventId, onResult } = event.detail;

    this.dialog
      .open<ReasonRejectDialogResult, ReasonRejectDialogData>(ReasonRejectDialogComponent, {
        data: {
          driverReview: driverReview,
          eventId: eventId
        }
      })
      .closed.pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (typeof onResult === 'function') {
          onResult(result);
        }
      });
  }
}
