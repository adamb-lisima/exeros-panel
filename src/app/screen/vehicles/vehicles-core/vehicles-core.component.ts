import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { first, Subject, Subscription, switchMap, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import RouteConst from '../../../const/route';
import { AppState } from '../../../store/app-store.model';
import { VehiclesSelectors } from '../vehicles.selectors';

@Component({
  templateUrl: './vehicles-core.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesCoreComponent implements OnInit, OnDestroy {
  @HostBinding('class') hostClass = 'h-full';

  vehicle$ = this.store.select(VehiclesSelectors.vehicle);
  private readonly sub = new Subscription();
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store<AppState>, private readonly router: Router) {}

  ngOnInit(): void {
    const subscription = this.store
      .select(VehiclesSelectors.selectedId)
      .pipe(
        first(selectedId => !selectedId),
        switchMap(() => this.store.select(VehiclesSelectors.vehicles)),
        first(vehicles => vehicles.length > 0),
        tap(vehicles => this.router.navigate(['/', RouteConst.vehicles, vehicles[0].id], { replaceUrl: true })),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.sub.add(subscription);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
