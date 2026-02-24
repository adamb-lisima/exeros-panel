import { Routes } from '@angular/router';
import RouteConst from 'src/app/const/route';
import { AuthorizedGuard } from 'src/app/guard/authorized.guard';
import { EventsCoreComponent } from 'src/app/screen/events/events-core/events-core.component';
import { EventsLeftComponent } from 'src/app/screen/events/events-left/events-left.component';
import { EventsTopComponent } from 'src/app/screen/events/events-top/events-top.component';
import { EventsGuard } from 'src/app/screen/events/events.guard';

export const EventsRouting: Routes = [
  {
    path: RouteConst.events,
    canActivate: [AuthorizedGuard, EventsGuard],
    canDeactivate: [EventsGuard],
    children: [
      { path: '', component: EventsCoreComponent },
      { path: '', component: EventsLeftComponent, outlet: 'left-menu' },
      { path: '', component: EventsTopComponent, outlet: 'top-menu' },
      { path: ':id', component: EventsCoreComponent },
      { path: ':id', component: EventsLeftComponent, outlet: 'left-menu' },
      { path: ':id', component: EventsTopComponent, outlet: 'top-menu' }
    ]
  }
];
