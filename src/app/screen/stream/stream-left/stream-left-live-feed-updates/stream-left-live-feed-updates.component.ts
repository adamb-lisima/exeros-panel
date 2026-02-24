import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { StreamActions } from 'src/app/screen/stream/stream.actions';
import { AlarmsParams } from 'src/app/screen/stream/stream.model';
import { StreamSelectors } from 'src/app/screen/stream/stream.selectors';
import { AppState } from 'src/app/store/app-store.model';

@Component({
  selector: 'app-stream-left-live-feed-updates',
  templateUrl: './stream-left-live-feed-updates.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StreamLeftLiveFeedUpdatesComponent {
  webSocketAlarms$ = this.store.select(state => state.webSocket.alarms);
  liveFeed$ = this.store.select(StreamSelectors.liveFeed);
  alarms$ = this.store.select(StreamSelectors.alarms);
  alarmsMeta$ = this.store.select(StreamSelectors.alarmsMeta);
  alarmsLoading$ = this.store.select(StreamSelectors.alarmsLoading);

  constructor(private readonly store: Store<AppState>) {}

  handleNextPageRequest(page: AlarmsParams['page']) {
    this.store.dispatch(StreamActions.fetchAlarms({ params: { page } }));
  }
}
