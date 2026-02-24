import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { StarRatingModule } from 'src/app/shared/component/star-rating/star-rating.module';
import { ChartModule } from 'src/app/shared/component/chart/chart.module';
import { OrdinalPipe } from '../../shared/pipe/event-name/ordinal-pipe';
import { LeaderboardCoreComponent } from './leaderboard-core/leaderboard-core.component';
import { LeaderboardTopComponent } from './leaderboard-top/leaderboard-top.component';
import { LeaderboardDriversComponent } from './leaderboard-core/leaderboard-drivers/leaderboard-drivers.component';
import { LeaderboardSafetyTrendsComponent } from './leaderboard-core/leaderboard-safety-trends/leaderboard-safety-trends.component';
import { SelectControlModule } from '../../shared/component/control/select-control/select-control.module';

@NgModule({
  declarations: [LeaderboardCoreComponent, LeaderboardTopComponent, LeaderboardDriversComponent, LeaderboardSafetyTrendsComponent, OrdinalPipe],
  imports: [SelectControlModule, CommonModule, MatIconModule, StarRatingModule, SharedModule, FormsModule, ReactiveFormsModule, ChartModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LeaderboardModule {}
