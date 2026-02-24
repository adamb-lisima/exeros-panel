import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, Subject, Subscription, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import RouteConst from 'src/app/const/route';
import { StreamSelectors } from 'src/app/screen/stream/stream.selectors';
import { filterNullish, firstNonNullish } from 'src/app/util/operators';
import { SelectControl } from '../../../shared/component/control/select-control/select-control.model';
import { AuthSelectors } from '../../../store/auth/auth.selectors';
import { CommonObjectsSelectors } from '../../../store/common-objects/common-objects.selectors';
import { AccessGroup } from '../../settings/settings.model';
import { StreamActions } from '../stream.actions';

@Component({
  templateUrl: './stream-top.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StreamTopComponent implements OnInit, OnDestroy {
  @HostBinding('class') hostClass = 'w-full';

  selectedId$ = this.store.select(StreamSelectors.selectedId);
  loggedInUser$ = this.store.select(AuthSelectors.loggedInUser);
  liveFeed$ = this.store.select(StreamSelectors.liveFeed);

  private readonly sub = new Subscription();
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store, private readonly router: Router, private readonly fb: FormBuilder) {}

  streamTypeControl = this.fb.control<'0' | '1'>('1');
  streamOptions: SelectControl<'0' | '1'>[] = [
    { label: 'Sub stream', value: '0' },
    { label: 'Main stream', value: '1' }
  ];
  vehicleControl = this.fb.control<number | undefined>(undefined);
  vehicleOptions$ = this.store.select(CommonObjectsSelectors.vehiclesTree).pipe(
    map((vehicles): SelectControl[] =>
      vehicles.map(vehicle => ({
        value: vehicle.id,
        label: vehicle.registration_plate,
        colorClass: vehicle.status === 'Active' ? 'text-success-500' : undefined
      }))
    )
  );

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
          this.streamTypeControl.reset('0', { emitEvent: false });

          this.store.dispatch(
            StreamActions.setLiveFeedStreamType({
              streamType: 'sub_stream'
            })
          );
          this.router.navigate(['/', RouteConst.stream, value]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
    this.sub.add(vehicleControlSub);
  }

  handleViewPlaybackClick(): void {
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

  protected readonly AccessGroup = AccessGroup;
}
