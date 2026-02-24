import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { map, pairwise, startWith, Subject, takeUntil, tap } from 'rxjs';
import { CommonObjectsSelectors } from '../../../store/common-objects/common-objects.selectors';
import { DEFAULT_FLEET_ID } from '../../../store/common-objects/common-objects.service';
import ControlUtil from '../../../util/control';
import { ReportsActions } from '../../reports/reports.actions';
import { AccessGroup } from '../../settings/settings.model';
import { LeaderboardService } from '../leaderboard.service';

@Component({
  selector: 'app-leaderboard-top',
  templateUrl: './leaderboard-top.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LeaderboardTopComponent implements OnInit, OnDestroy {
  @HostBinding('class') hostClass = 'w-full';

  fleetOptions$ = this.store.select(CommonObjectsSelectors.fleetsTree).pipe(map(fleetsTree => ControlUtil.mapFleetsTreeToTreeControls(fleetsTree)));
  bodyGroup = this.fb.group({
    fleet_id: DEFAULT_FLEET_ID
  });

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly service: LeaderboardService, private readonly store: Store, private readonly fb: NonNullableFormBuilder) {}

  ngOnInit(): void {
    this.loadSavedFleetId();

    this.bodyGroup.valueChanges
      .pipe(
        startWith(this.bodyGroup.value),
        pairwise(),
        tap(([, curr]) => {
          if (curr.fleet_id !== undefined) {
            localStorage.setItem('exeros-fleet-id', String(curr.fleet_id ?? ''));
          }
          this.store.dispatch(ReportsActions.setFleetId({ fleetId: curr.fleet_id ?? DEFAULT_FLEET_ID }));
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSavedFleetId(): void {
    const savedFleetId = localStorage.getItem('exeros-fleet-id');
    if (savedFleetId) {
      const fleetId = parseInt(savedFleetId, 10);
      if (!isNaN(fleetId)) {
        this.bodyGroup.patchValue({ fleet_id: fleetId }, { emitEvent: false });
        this.store.dispatch(ReportsActions.setFleetId({ fleetId }));
      }
    }
  }

  handleExportClick(): void {
    const fleetId = this.bodyGroup.controls.fleet_id.value ?? DEFAULT_FLEET_ID;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const rangeFilter = {
      from: this.formatDate(startOfMonth),
      to: this.formatDate(endOfMonth)
    };

    this.service.exportLeaderboardPdf(fleetId, rangeFilter).pipe(takeUntil(this.destroy$)).subscribe();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  protected readonly accessGroup = AccessGroup;
}
