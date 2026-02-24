import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, first, Subject, switchMap, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import RouteConst from 'src/app/const/route';
import { EventsSelectors } from 'src/app/screen/events/events.selectors';
import { AppState } from 'src/app/store/app-store.model';
import { AccessGroup } from '../../settings/settings.model';

@Component({
  templateUrl: './events-core.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsCoreComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  @HostBinding('class') hostClass = 'h-full';
  accessGroup = AccessGroup;
  event$ = this.store.select(EventsSelectors.event);

  mode$ = this.store.select(EventsSelectors.mode);
  constructor(private readonly store: Store<AppState>, private readonly router: Router) {}

  ngOnInit(): void {
    this.store
      .select(EventsSelectors.selectedId)
      .pipe(
        first(selectedId => !selectedId),
        switchMap(() => this.store.select(EventsSelectors.events)),
        filter(events => events.length > 0),
        first(),
        tap(events => this.router.navigate(['/', RouteConst.events, events[0].id], { replaceUrl: true })),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
