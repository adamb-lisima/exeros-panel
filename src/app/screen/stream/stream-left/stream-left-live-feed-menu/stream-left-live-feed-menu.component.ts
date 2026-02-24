import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of, Subject, Subscription } from 'rxjs';
import { filter, map, take, takeUntil } from 'rxjs/operators';
import RouteConst from 'src/app/const/route';
import { AppState } from 'src/app/store/app-store.model';
import { ReportIssueModalComponent } from '../../../../shared/component/report-issue-modal/report-issue-modal.component';
import { VehiclesElement } from '../../stream.model';
import { StreamSelectors } from '../../stream.selectors';

@Component({
  selector: 'app-stream-left-live-feed-menu',
  templateUrl: './stream-left-live-feed-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StreamLeftLiveFeedMenuComponent implements OnInit {
  private selectedVehicle$: Observable<VehiclesElement | undefined> = of(undefined);
  private readonly destroy$ = new Subject<void>();
  private readonly subscriptions = new Subscription();

  constructor(private readonly router: Router, private readonly dialog: Dialog, private readonly store: Store<AppState>) {}

  ngOnInit(): void {
    const selectedId$ = this.store.select(StreamSelectors.selectedId).pipe(filter(id => !!id));

    const vehicles$ = this.store.select(StreamSelectors.vehicles).pipe(filter(vehicles => !!vehicles && vehicles.length > 0));

    this.selectedVehicle$ = combineLatest([selectedId$, vehicles$]).pipe(
      map(([selectedId, vehicles]) => vehicles.find(v => v.id === selectedId)),
      filter((vehicle): vehicle is VehiclesElement => !!vehicle)
    );
  }

  handleBackClick(): void {
    this.router.navigate(['/', RouteConst.stream]);
  }

  handleViewStreamClick(): void {
    this.router.navigate(['/', RouteConst.stream]);
  }

  openReportIssueModal(): void {
    const reportSub = this.selectedVehicle$.pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: vehicle => {
        this.dialog.open<ReportIssueModalComponent>(ReportIssueModalComponent, {
          width: '500px',
          data: {
            vehicleId: vehicle?.id,
            vehicleRegistrationPlate: vehicle?.registration_plate,
            isVehicleIssue: true
          }
        });
      },
      error: (error: unknown) => {
        console.error('Error opening report issue modal:', error);
      }
    });

    this.subscriptions.add(reportSub);
  }
}
