import { Routes } from '@angular/router';
import RouteConst from 'src/app/const/route';
import { AuthorizedGuard } from '../../../guard/authorized.guard';
import { RouteData } from '../../../model/route.models';
import { StreamGuard } from '../../stream/stream.guard';
import { PlaybackCoreComponent } from './playback-core/playback-core.component';

const data: RouteData = { hideTopBar: true, hideNavBar: true, removeContainerMargin: true };

export const PlaybackRouting: Routes = [
  {
    path: RouteConst.iframeApiPlayback,
    canActivate: [AuthorizedGuard, StreamGuard],
    canDeactivate: [StreamGuard],
    children: [{ path: '', component: PlaybackCoreComponent, data }]
  }
];
