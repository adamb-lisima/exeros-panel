import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import Route from '../../../../const/route';
import { EventsElement, EventsMeta } from '../../../../screen/drivers/drivers.model';

@Component({
  selector: 'app-events-tab-base',
  templateUrl: './events-tab-base.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsTabBaseComponent {
  @Input() events: EventsElement[] | null | undefined = null;
  @Input() eventsLoading: boolean | null | undefined = false;
  @Input() eventsMeta: EventsMeta | null | undefined = null;

  constructor(private readonly router: Router) {}

  trackByField(field: string) {
    return (index: number, item: any) => item?.[field];
  }

  handleEventClick(event: EventsElement): void {
    this.router.navigate([Route.events, event.id]);
  }
}
