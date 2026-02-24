import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { StreamSelectors } from 'src/app/screen/stream/stream.selectors';
import RouteConst from '../../../../const/route';
import { LiveFeed } from '../../../../service/http/live-feeds/live-feeds.model';
import { AccessGroup } from '../../../settings/settings.model';
import { StreamLeftLiveFeedDriverMessageData, StreamLeftLiveFeedDriverMessageDialogComponent } from '../stream-left-live-feed-driver-message-dialog/stream-left-live-feed-driver-message-dialog.component';

@Component({
  selector: 'app-stream-left-live-feed-driver',
  templateUrl: './stream-left-live-feed-driver.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StreamLeftLiveFeedDriverComponent {
  readonly AccessGroup = AccessGroup;
  liveFeed$ = this.store.select(StreamSelectors.liveFeed);

  constructor(private readonly store: Store, private readonly router: Router, private readonly dialog: Dialog) {}

  handleDriverClick(driver: NonNullable<LiveFeed['driver']>): void {
    this.router.navigate(['/', RouteConst.drivers, driver.id]);
  }

  handleMessageClick(driver: NonNullable<LiveFeed['driver']>) {
    this.dialog.open<void, StreamLeftLiveFeedDriverMessageData>(StreamLeftLiveFeedDriverMessageDialogComponent, { data: { driver } });
  }
}
