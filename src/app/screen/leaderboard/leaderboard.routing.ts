import { Routes } from '@angular/router';
import RouteConst from 'src/app/const/route';
import { AuthorizedGuard } from 'src/app/guard/authorized.guard';
import { LeaderboardCoreComponent } from './leaderboard-core/leaderboard-core.component';
import { LeaderboardTopComponent } from './leaderboard-top/leaderboard-top.component';
import { LeaderboardGuard } from './leaderboard.guard';

export const LeaderboardRouting: Routes = [
  {
    path: RouteConst.leaderboard,
    canActivate: [AuthorizedGuard, LeaderboardGuard],
    canDeactivate: [LeaderboardGuard],
    children: [
      { path: '', component: LeaderboardCoreComponent },
      { path: '', component: LeaderboardTopComponent, outlet: 'top-menu' }
    ]
  }
];
