import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, filter, tap, switchMap, first } from 'rxjs/operators';
import { EventsChangeStatusDialogComponent } from '../../../../shared/component/dialog/events-change-status-dialog/events-change-status-dialog.component';
import { EventsChangeStatusDialogData, EventsChangeStatusDialogReturn } from '../../../../shared/component/dialog/events-change-status-dialog/events-change-status-dialog.model';
import { HumanizePipe } from '../../../../shared/pipe/humanize/humanize.pipe';
import { AuthSelectors } from '../../../../store/auth/auth.selectors';
import { ConfigSelectors } from '../../../../store/config/config.selectors';
import { EventsActions } from '../../events.actions';
import { EventsSelectors } from '../../events.selectors';

@Component({
  selector: 'app-events-core-status',
  templateUrl: './events-core-status.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsCoreStatusComponent implements OnInit, OnDestroy {
  private readonly humanize = new HumanizePipe();
  private readonly destroy$ = new Subject<void>();

  event$ = this.store.select(EventsSelectors.event);
  configData$ = this.store.select(ConfigSelectors.data);
  loggedInUser$ = this.store.select(AuthSelectors.loggedInUser);

  eventData: string = '{}';
  userData: string = '{}';

  @ViewChild('eventsStatus') eventsStatusRef!: ElementRef;

  private readonly statusChangeHandler: any;

  constructor(private readonly store: Store, private readonly dialog: Dialog, private readonly cdr: ChangeDetectorRef) {
    this.statusChangeHandler = this.handleStatusChange.bind(this);
  }

  ngOnInit(): void {
    this.loadVueComponent();

    this.event$.pipe(takeUntil(this.destroy$)).subscribe(event => {
      if (event) {
        this.eventData = JSON.stringify(event);
        this.cdr.detectChanges();
      }
    });

    this.loggedInUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user) {
        this.userData = JSON.stringify(user);
        this.cdr.detectChanges();
      }
    });

    window.addEventListener('status-change', this.statusChangeHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('status-change', this.statusChangeHandler);
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadVueComponent(): void {
    if (!customElements.get('events-status')) {
      const script = document.createElement('script');
      script.src = 'assets/vue-widget.js';
      script.type = 'module';

      document.head.appendChild(script);
    }
  }

  handleStatusChange(event: CustomEvent): void {
    if (!event.detail) return;

    const { status, event: eventData } = event.detail;

    this.configData$
      .pipe(
        first(),
        switchMap(configData => {
          const falseEventOptions = configData?.event_status_details?.['false_event'] ?? {};
          const eventKey = eventData.default_type?.toLowerCase().replace(/[\s-]+/g, '_') ?? '';
          const options = falseEventOptions[eventKey] ?? [];

          return this.dialog.open<EventsChangeStatusDialogReturn, EventsChangeStatusDialogData>(EventsChangeStatusDialogComponent, {
            data: {
              header: `Do you want to set the "${this.humanize.transform(status)}" status?`,
              showTextInput: true,
              textLabel: 'Description',
              showSelectInput: status === 'FALSE_EVENT' && options.length > 0,
              selectLabel: 'False Event Reason',
              options: options.map(element => ({
                label: element,
                value: element
              })),
              showDriverFatigueInputFields: eventData.event_type === 'Driver Fatigue' && status === 'ESCALATED'
            },
            autoFocus: 'dialog'
          }).closed;
        }),
        filter(data => !!data?.confirmed),
        tap(data =>
          this.store.dispatch(
            EventsActions.editEvent({
              body: {
                status,
                comment: data?.text ?? '',
                status_details: data?.select,
                driver_fatigue_asleep_at_wheel: data?.driverFatigueText1,
                driver_fatigue_accident_or_injury: data?.driverFatigueText2,
                driver_fatigue_signs_of_fatigue: data?.driverFatigueText3
              }
            })
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.store.dispatch(EventsActions.fetchEvents({ params: { status: 'NEW' } }));
  }
}
