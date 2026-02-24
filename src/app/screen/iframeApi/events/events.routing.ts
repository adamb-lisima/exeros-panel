import { Routes } from '@angular/router';
import RouteConst from 'src/app/const/route';
import { AuthorizedGuard } from '../../../guard/authorized.guard';
import { RouteData } from '../../../model/route.models';
import { EventsCoreComponent } from './events-core/events-core.component';
import { EventsGuard } from './events.guard';

const data: RouteData = { hideTopBar: true, hideNavBar: true, removeContainerMargin: true };

export const EventsIframeRouting: Routes = [
  {
    path: RouteConst.iframeApiEvents,
    canActivate: [AuthorizedGuard, EventsGuard],
    canDeactivate: [EventsGuard],
    children: [{ path: '', component: EventsCoreComponent, data }]
  }
];
