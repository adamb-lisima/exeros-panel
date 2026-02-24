import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Subject, takeUntil, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import RouteConst from '../../../../const/route';
import { AuthSelectors } from '../../../../store/auth/auth.selectors';
import { firstNonNullish } from '../../../../util/operators';
import { ParamsUtil } from '../../../../util/params.util';
import { AccessGroup } from '../../../settings/settings.model';
import { EventsCoreExtendEventComponent } from '../../events-core/events-core-extend-event/events-core-extend-event.component';
import { EventsActions } from '../../events.actions';
import { Event } from '../../events.model';
import { EventsSelectors } from '../../events.selectors';

@Component({
  selector: 'app-events-top-menu',
  templateUrl: './events-top-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsTopMenuComponent implements OnDestroy {
  @Input() event: Event | undefined;
  accessGroup = AccessGroup;

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store, private readonly dialog: Dialog) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleExportClick(): void {
    combineLatest([this.store.select(AuthSelectors.accessToken).pipe(firstNonNullish()), this.store.select(EventsSelectors.selectedId).pipe(firstNonNullish())])
      .pipe(
        tap(([accessToken, selectedId]) => {
          let url = environment.production ? `${location.origin}/#/${RouteConst.events}/${selectedId}` : `https://exeros-dev-ui.exeros.cloud/#/events/${selectedId}`;
          url = ParamsUtil.addHashQueryParam(url, 'mode', 'screenshot');
          url = ParamsUtil.addHashQueryParam(url, 'token', accessToken);
          this.store.dispatch(EventsActions.screenEvent({ params: { url, full_page: true } }));
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  handleDownloadClick(): void {
    this.store.dispatch(EventsActions.downloadVideos());
  }

  handleExtendClick() {
    if (this.event) {
      this.dialog.open(EventsCoreExtendEventComponent, { data: this.event });
    }
  }
}
