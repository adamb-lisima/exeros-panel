import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { first, Subject, switchMap, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import RouteConst from '../../../const/route';
import { AppState } from '../../../store/app-store.model';
import { DriversSelectors } from '../drivers.selectors';

@Component({
  templateUrl: './drivers-core.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriversCoreComponent implements OnInit, OnDestroy {
  @HostBinding('class') hostClass = 'h-full';
  driver$ = this.store.select(DriversSelectors.driver);
  liveFeed$ = this.store.select(DriversSelectors.liveFeed);
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store<AppState>, private readonly router: Router) {}

  ngOnInit(): void {
    this.store
      .select(DriversSelectors.selectedId)
      .pipe(
        first(selectedId => !selectedId),
        switchMap(() => this.store.select(DriversSelectors.drivers)),
        first(drivers => drivers.length > 0),
        tap(drivers => this.router.navigate(['/', RouteConst.drivers, drivers[0].id], { replaceUrl: true })),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
