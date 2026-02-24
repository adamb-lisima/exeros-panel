import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, first, map, Observable, Subject, switchMap, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EventsSelectors } from 'src/app/screen/events/events.selectors';
import { EventsChangeStatusDialogComponent } from '../../../shared/component/dialog/events-change-status-dialog/events-change-status-dialog.component';
import { EventsChangeStatusDialogData, EventsChangeStatusDialogReturn } from '../../../shared/component/dialog/events-change-status-dialog/events-change-status-dialog.model';
import { HumanizePipe } from '../../../shared/pipe/humanize/humanize.pipe';
import { AuthSelectors } from '../../../store/auth/auth.selectors';
import { ConfigSelectors } from '../../../store/config/config.selectors';
import EventUtil from '../../../util/event';
import { AccessGroup } from '../../settings/settings.model';
import { EventsActions } from '../events.actions';
import { Event } from '../events.model';

@Component({
  templateUrl: './events-top.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsTopComponent {
  @HostBinding('class') hostClass = 'w-full';

  private readonly destroy$ = new Subject<void>();

  event$ = this.store.select(EventsSelectors.event);
  configData$ = this.store.select(ConfigSelectors.data);

  accessGroup = AccessGroup;
  eventUtil = EventUtil;
  private readonly humanize = new HumanizePipe();

  falseEventStatusDetails$ = combineLatest([this.configData$, this.event$]).pipe(
    map(([configData, event]): { label: string; value: string }[] =>
      configData && event && configData.event_status_details['false_event']?.[event.default_type.toLowerCase().replace(/\s+/g, '_')]
        ? configData.event_status_details['false_event'][event.default_type.toLowerCase().replace(/\s+/g, '_')].map(element => ({
            label: element,
            value: element
          }))
        : []
    )
  );

  isStatusVisible$: Observable<boolean> = combineLatest([this.configData$, this.event$]).pipe(
    map(([configData, event]) => {
      if (!configData?.event_phases_module) {
        return true;
      }
      const isEventPhasesModuleVisible = configData?.event_phases_module ?? false;
      const isEventConditionMet = event?.phase === 'managed-service';

      return isEventPhasesModuleVisible && isEventConditionMet;
    })
  );

  loggedInUser$ = this.store.select(AuthSelectors.loggedInUser);

  constructor(private readonly store: Store, private readonly dialog: Dialog) {}

  handleStatusClick(event: Event, status: Event['status']): void {
    if (event.status === status) {
      return;
    }
    if (status !== 'FALSE_EVENT' && status !== 'TEST') {
      return;
    }

    const statusLabel = this.humanize.transform(status);

    this.falseEventStatusDetails$
      .pipe(
        first(),
        switchMap(
          options =>
            this.dialog.open<EventsChangeStatusDialogReturn, EventsChangeStatusDialogData>(EventsChangeStatusDialogComponent, {
              data: {
                header: `Do you want to set the "${statusLabel}" status?`,
                showTextInput: true,
                textLabel: 'Description',
                selectLabel: 'False Event Reason',
                showSelectInput: status === 'FALSE_EVENT' && options.length > 0,
                options: options
              },
              autoFocus: 'dialog'
            }).closed
        ),
        first(data => !!data?.confirmed),
        tap(data =>
          this.store.dispatch(
            EventsActions.editEvent({
              body: { status: status, comment: data?.text ?? '', status_details: data?.select, driver_fatigue_asleep_at_wheel: undefined, driver_fatigue_accident_or_injury: undefined, driver_fatigue_signs_of_fatigue: undefined }
            })
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }
}
