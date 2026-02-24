import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { map } from 'rxjs';
import DateConst from '../../../../const/date';
import RouteConst from '../../../../const/route';
import { EventsSelectors } from '../../events.selectors';

interface AuditTrail {
  user: string;
  action: string;
  text?: string;
  related_event_id?: string;
  date: string;
  comment?: string;
  status_details?: string;
  driver_fatigue_fields?: { driver_fatigue_asleep_at_wheel: string; driver_fatigue_accident_or_injury: string; driver_fatigue_signs_of_fatigue: string } | null;
}

@Component({
  selector: 'app-events-core-audit-trail',
  templateUrl: './events-core-audit-trail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsCoreAuditTrailComponent {
  private readonly statusMap: Record<string, string> = {
    REVIEW_REQUIRED: 'Review required',
    ESCALATED: 'Escalated',
    FALSE_EVENT: 'False event',
    DO_NOT_ESCALATE: 'Do not escalate',
    REVIEWED: 'Event reviewed',
    TEST: 'Test event',
    INVALID_VIDEO: 'Invalid video',
    REVIEW_OPTIONAL: 'Review optional'
  };

  auditTrails$ = this.store.select(EventsSelectors.event).pipe(
    map((event): AuditTrail[] =>
      event
        ? [
            ...event.history.map(
              (history): AuditTrail => ({
                user: history.user_name,
                action: `${this.formatStatus(history.action)} on this event.` + (history.status_details ? ' Reason: ' + history.status_details : ''),
                date: history.date,
                text: history.comment,
                driver_fatigue_fields: history.driver_fatigue_fields ?? null
              })
            ),
            ...event.comments.map(
              (comment): AuditTrail => ({
                user: comment.user.name,
                action: 'commented on this event',
                text: comment.comment,
                date: comment.date,
                related_event_id: comment.related_event_id
              })
            )
          ].sort((a, b) => {
            const aMillis = DateTime.fromFormat(a.date, DateConst.serverDateTimeFormat).toMillis();
            const bMillis = DateTime.fromFormat(b.date, DateConst.serverDateTimeFormat).toMillis();
            return aMillis < bMillis ? 1 : -1;
          })
        : []
    )
  );

  formatStatus(action: string): string {
    Object.keys(this.statusMap).forEach(statusCode => {
      if (action.includes(statusCode)) {
        action = action.replace(statusCode, this.statusMap[statusCode]);
      }
    });

    return action;
  }

  handleEventClick(id: string | null): void {
    if (id) {
      const tree = this.router.createUrlTree([`/${RouteConst.events}`, id]);
      const url = this.router.serializeUrl(tree);
      window.open(window.location.origin + '/#/' + url.replace(/^\//, ''), '_blank');
    }
  }
  constructor(private readonly store: Store, private readonly router: Router) {}
}
