import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { MapCoordinates } from '../../../model/map.model';
import { AppState } from '../../../store/app-store.model';
import { FleetsSelectors } from '../fleets.selectors';
import { FleetsService } from '../fleets.service';

@Component({
  templateUrl: './fleets-core.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FleetsCoreComponent implements OnInit, OnDestroy {
  @HostBinding('class') hostClass = 'h-full';

  constructor(private readonly store: Store<AppState>, private readonly router: Router, private readonly fleetsService: FleetsService) {}
  private sub?: Subscription;
  eventsStats$ = this.store.select(FleetsSelectors.eventsStats);

  center: MapCoordinates = [54.7029041, -4.3958726];
  ngOnInit(): void {
    this.sub = new Subscription();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
