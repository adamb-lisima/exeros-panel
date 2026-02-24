import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { StreamSelectors } from '../stream.selectors';
import { AccessGroup } from '../../settings/settings.model';

@Component({
  templateUrl: './stream-left.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideInPanel', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate(
          '300ms ease-in-out',
          style({ transform: 'translateX(0)', opacity: 1 })
        )
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in-out',
          style({ transform: 'translateX(100%)', opacity: 0 })
        )
      ])
    ])
  ]
})
export class StreamLeftComponent {
  accessGroup = AccessGroup;

  hasSelectedVehicle$ = this.store
    .select(StreamSelectors.selectedId)
    .pipe(map(id => !!id));

  constructor(private readonly store: Store) {}
}
