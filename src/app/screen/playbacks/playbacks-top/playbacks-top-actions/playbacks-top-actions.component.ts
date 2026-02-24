import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { filter, map, take, takeUntil } from 'rxjs/operators';
import RouteConst from '../../../../const/route';
import { ReportIssueModalComponent } from '../../../../shared/component/report-issue-modal/report-issue-modal.component';
import { VehiclesElement } from '../../../stream/stream.model';
import { StreamSelectors } from '../../../stream/stream.selectors';

@Component({
  selector: 'app-playbacks-top-actions',
  templateUrl: './playbacks-top-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaybacksTopActionsComponent implements OnInit, OnDestroy {
  private selectedVehicle$: Observable<VehiclesElement | undefined> = of(undefined);
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store, private readonly dialog: Dialog, private readonly router: Router) {}

  ngOnInit(): void {
    const selectedId$ = this.store.select(StreamSelectors.selectedId).pipe(filter(id => !!id));

    const vehicles$ = this.store.select(StreamSelectors.vehicles).pipe(filter(vehicles => !!vehicles && vehicles.length > 0));

    this.selectedVehicle$ = combineLatest([selectedId$, vehicles$]).pipe(
      map(([selectedId, vehicles]) => vehicles.find(v => v.id === selectedId)),
      filter((vehicle): vehicle is VehiclesElement => !!vehicle)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleBackClick(): void {
    const storedTab = sessionStorage.getItem('lastVisitedTab');

    if (storedTab) {
      if (storedTab === RouteConst.stream) {
        this.handleStreamNavigation();
      } else {
        this.router.navigate(['/', storedTab]);
      }
    } else {
      this.store
        .select(StreamSelectors.getLastTab)
        .pipe(take(1), takeUntil(this.destroy$))
        .subscribe(lastTab => {
          if (lastTab === RouteConst.stream) {
            this.handleStreamNavigation();
          } else {
            this.router.navigate(['/', lastTab]);
          }
        });
    }
  }

  private handleStreamNavigation(): void {
    this.store
      .select(StreamSelectors.selectedId)
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe(selectedId => {
        if (selectedId) {
          this.router.navigate(['/', RouteConst.stream, selectedId]);
        } else {
          this.router.navigate(['/', RouteConst.stream]);
        }
      });
  }

  handleViewStreamClick(): void {
    this.router.navigate(['/', RouteConst.stream]);
  }

  openReportIssueModal(): void {
    this.selectedVehicle$.pipe(take(1), takeUntil(this.destroy$)).subscribe(vehicle => {
      this.dialog.open<ReportIssueModalComponent>(ReportIssueModalComponent, {
        width: '500px',
        data: {
          vehicleId: vehicle?.id,
          vehicleRegistrationPlate: vehicle?.registration_plate,
          isVehicleIssue: true
        }
      });
    });
  }
}
