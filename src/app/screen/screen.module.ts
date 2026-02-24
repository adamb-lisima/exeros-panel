import { NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule, Routes } from '@angular/router';
import RouteConst from 'src/app/const/route';
import { DashboardModule } from 'src/app/screen/dashboard/dashboard.module';
import { DashboardRouting } from 'src/app/screen/dashboard/dashboard.routing';
import { DriversModule } from 'src/app/screen/drivers/drivers.module';
import { EventsModule } from 'src/app/screen/events/events.module';
import { EventsRouting } from 'src/app/screen/events/events.routing';
import { LoginModule } from 'src/app/screen/login/login.module';
import { LoginRouting } from 'src/app/screen/login/login.routing';
import { ResetPasswordTokenModule } from 'src/app/screen/reset-password-token/reset-password-token.module';
import { ResetPasswordModule } from 'src/app/screen/reset-password/reset-password.module';
import { ResetPasswordRouting } from 'src/app/screen/reset-password/reset-password.routing';
import { StreamModule } from 'src/app/screen/stream/stream.module';
import { StreamRouting } from 'src/app/screen/stream/stream.routing';
import { DriversRouting } from './drivers/drivers.routing';
import { FleetsModule } from './fleets/fleets.module';
import { FleetsRouting } from './fleets/fleets.routing';
import { GuideModule } from './guide/guide.module';
import { GuideRouting } from './guide/guide.routing';
import { EventsIframeModule } from './iframeApi/events/events.module';
import { EventsIframeRouting } from './iframeApi/events/events.routing';
import { LivestreamModule } from './iframeApi/livestream/livestream.module';
import { LivestreamRouting } from './iframeApi/livestream/livestream.routing';
import { PlaybackModule } from './iframeApi/playback/playback.module';
import { PlaybackRouting } from './iframeApi/playback/playback.routing';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { LeaderboardRouting } from './leaderboard/leaderboard.routing';
import { MapViewModule } from './map-view/map-view.module';
import { MapViewRouting } from './map-view/map-view.routing';
import { PlaybacksModule } from './playbacks/playbacks.module';
import { PlaybacksRouting } from './playbacks/playbacks.routing';
import { ReportsModule } from './reports/reports.module';
import { ReportsRouting } from './reports/reports.routing';
import { ResetPasswordTokenRouting } from './reset-password-token/reset-password-token.routing';
import { SettingsModule } from './settings/settings.module';
import { SettingsRouting } from './settings/settings.routing';
import { TelematicsModule } from './telematics/telematics.module';
import { TelematicsRouting } from './telematics/telematics.routing';
import { VehiclesModule } from './vehicles/vehicles.module';
import { VehiclesRouting } from './vehicles/vehicles.routing';
import { WatchClipRouting } from './watch-clip/watch-clip.routing';
import { WatchClipModule } from './watch-clip/watchclip.module';

const routes: Routes = [...LoginRouting, ...ResetPasswordRouting, ...ResetPasswordTokenRouting, ...DashboardRouting, ...StreamRouting, ...DriversRouting, ...VehiclesRouting, ...EventsRouting, ...SettingsRouting, ...TelematicsRouting, ...ReportsRouting, ...FleetsRouting, ...LivestreamRouting, ...EventsIframeRouting, ...PlaybackRouting, ...PlaybacksRouting, ...MapViewRouting, ...WatchClipRouting, ...GuideRouting, ...LeaderboardRouting, { path: '**', redirectTo: RouteConst.dashboard }];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule, LoginModule, ResetPasswordModule, ResetPasswordTokenModule, DashboardModule, StreamModule, DriversModule, VehiclesModule, EventsModule, SettingsModule, TelematicsModule, ReportsModule, FleetsModule, LivestreamModule, PlaybackModule, EventsIframeModule, PlaybacksModule, MatFormFieldModule, MatInputModule, MapViewModule, WatchClipModule, GuideModule, LeaderboardModule]
})
export class ScreenModule {}
