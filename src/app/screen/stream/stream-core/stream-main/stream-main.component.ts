import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { MapCoordinates } from '../../../../model/map.model';
import { AppState } from '../../../../store/app-store.model';
import { AuthSelectors } from '../../../../store/auth/auth.selectors';
import MapUtil from '../../../../util/map';
import { StreamSelectors } from '../../stream.selectors';

@Component({
  selector: 'app-stream-main',
  templateUrl: './stream-main.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StreamMainComponent {
  selectedId$ = this.store.select(StreamSelectors.selectedId);
  playbackActive$ = this.store.select(StreamSelectors.playbackActive);
  markers$ = this.store.select(StreamSelectors.mapVehicles).pipe(map(vehicles => vehicles.map(vehicle => MapUtil.mapVehicleToMapMarkerData(vehicle))));
  center: MapCoordinates = [54.7029041, -4.3958726];
  loggedInUser$ = this.store.select(AuthSelectors.loggedInUser);
  liveFeed$ = this.store.select(StreamSelectors.liveFeed);

  constructor(private readonly store: Store<AppState>) {}
}
