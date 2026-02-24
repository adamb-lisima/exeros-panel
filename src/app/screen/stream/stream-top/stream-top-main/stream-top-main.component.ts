import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, Subject, Subscription, take, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import RouteConst from '../../../../const/route';
import { SelectControl } from '../../../../shared/component/control/select-control/select-control.model';
import { AuthSelectors } from '../../../../store/auth/auth.selectors';
import { CommonObjectsSelectors } from '../../../../store/common-objects/common-objects.selectors';
import { filterNullish, firstNonNullish } from '../../../../util/operators';
import { DriversLeftMessageDialogComponent } from '../../../drivers/drivers-left/drivers-left-message-dialog/drivers-left-message-dialog.component';
import { DriversElement } from '../../../drivers/drivers.model';
import { StreamActions } from '../../stream.actions';
import { StreamSelectors } from '../../stream.selectors';
import { AccessGroup } from '../../../settings/settings.model';

@Component({
  selector: 'app-stream-top-main',
  templateUrl: './stream-top-main.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StreamTopMainComponent implements OnInit, OnDestroy {
  selectedId$ = this.store.select(StreamSelectors.selectedId);
  loggedInUser$ = this.store.select(AuthSelectors.loggedInUser);
  private readonly sub = new Subscription();
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store, private readonly router: Router, private readonly fb: FormBuilder, private readonly dialog: Dialog) {}

  streamTypeControl = this.fb.control<'1' | '0'>('1');
  streamOptions: SelectControl<'1' | '0'>[] = [
    { label: 'Standard quality', value: '0' },
    { label: 'High quality', value: '1' }
  ];
  vehicleControl = this.fb.control<number | undefined>(undefined);
  vehicleOptions$ = this.store.select(CommonObjectsSelectors.vehiclesTree).pipe(
    map((vehicles): SelectControl[] =>
      vehicles.map(vehicle => ({
        value: vehicle.id,
        label: vehicle.registration_plate,
        colorClass: vehicle.status === 'Active' ? 'text-extra-one' : undefined
      }))
    )
  );
  liveFeed$ = this.store.select(StreamSelectors.liveFeed);

  driver$ = this.liveFeed$.pipe(
    filterNullish(),
    map(liveFeed => liveFeed.driver)
  );

  providerInfo$ = this.store.select(StreamSelectors.liveFeed).pipe(
    map(liveFeed => {
      if (liveFeed?.cameras && liveFeed.cameras.length > 0) {
        return liveFeed.cameras[0].provider;
      }
      return null;
    })
  );

  isSuperAdmin$ = this.store.select(AuthSelectors.isSuperAdmin);

  ngOnInit(): void {
    const selectedIdSub = this.store
      .select(StreamSelectors.selectedId)
      .pipe(
        filterNullish(),
        tap(selectedId => this.vehicleControl.reset(selectedId, { emitEvent: false })),
        takeUntil(this.destroy$)
      )
      .subscribe();
    this.sub.add(selectedIdSub);

    const vehicleControlSub = this.vehicleControl.valueChanges
      .pipe(
        filterNullish(),
        tap(value => {
          this.streamTypeControl.reset('1', { emitEvent: false });
          this.router.navigate(['/', RouteConst.stream, value]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
    this.sub.add(vehicleControlSub);

    const streamTypeControlSub = this.streamTypeControl.valueChanges
      .pipe(
        tap(streamTypeValue => {
          const selectedStreamType = streamTypeValue === '1' ? 'main_stream' : 'sub_stream';
          this.store.dispatch(StreamActions.setLiveFeedStreamType({ streamType: selectedStreamType }));
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
    this.sub.add(streamTypeControlSub);

    const liveFeedStreamTypeSub = this.store
      .select(StreamSelectors.liveFeedStreamType)
      .pipe(
        take(1),
        tap(streamType => {
          const controlValue = streamType === 'main_stream' ? '1' : '0';
          this.streamTypeControl.setValue(controlValue, { emitEvent: false });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
    this.sub.add(liveFeedStreamTypeSub);
  }

  handleViewPlaybackClick(): void {
    this.store.dispatch(StreamActions.setLastVisitedTab({ route: RouteConst.stream }));
    sessionStorage.setItem('lastVisitedTab', RouteConst.stream);

    const playbackSub = this.store
      .select(StreamSelectors.selectedId)
      .pipe(
        firstNonNullish(),
        tap(selectedId => {
          this.store.dispatch(StreamActions.setSelectedId({ id: selectedId }));
          this.router.navigate(['/', RouteConst.playbacks, selectedId]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.sub.add(playbackSub);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleMessageClick(driver?: DriversElement): void {
    const fleetId = localStorage.getItem('exeros-fleet-id');
    const selectedIdSub = this.store
      .select(StreamSelectors.selectedId)
      .pipe(
        firstNonNullish(),
        tap(selectedId => {
          this.dialog.open(DriversLeftMessageDialogComponent, {
            data: {
              driver: driver,
              fleetId: fleetId ? parseInt(fleetId, 10) : 1,
              vehicleId: selectedId
            }
          });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.sub.add(selectedIdSub);
  }

  protected readonly AccessGroup = AccessGroup;
}
