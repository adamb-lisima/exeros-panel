import { Routes } from '@angular/router';
import RouteConst from 'src/app/const/route';
import { AuthorizedGuard } from '../../guard/authorized.guard';
import { StreamGuard } from '../stream/stream.guard';
import { PlaybacksCoreComponent } from './playbacks-core/playbacks-core.component';
import { PlaybacksTopComponent } from './playbacks-top/playbacks-top.component';

export const PlaybacksRouting: Routes = [
  {
    path: RouteConst.playbacks,
    canActivate: [AuthorizedGuard, StreamGuard],
    children: [
      { path: ':id', component: PlaybacksCoreComponent },
      { path: '', component: PlaybacksTopComponent, outlet: 'top-menu' },
      { path: '', component: PlaybacksCoreComponent }
    ]
  }
];
