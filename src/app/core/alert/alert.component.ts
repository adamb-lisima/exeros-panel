import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, Subject, switchMap, tap, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertActions } from 'src/app/store/alert/alert.actions';
import { AlertSelectors } from 'src/app/store/alert/alert.selectors';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [trigger('fade', [state('in', style({ opacity: 1 })), transition(':enter', [style({ opacity: 0 }), animate(400)]), transition(':leave', animate(400, style({ opacity: 0 })))])]
})
export class AlertComponent implements OnInit, OnDestroy {
  alert$ = this.store.select(AlertSelectors.alert);
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store) {}

  ngOnInit(): void {
    this.store
      .select(AlertSelectors.alert)
      .pipe(
        filter(alert => !!alert),
        switchMap(() => timer(5000).pipe(tap(() => this.removeAlert()))),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleCloseClick() {
    this.removeAlert();
  }

  private removeAlert() {
    this.store.dispatch(AlertActions.hide());
  }
}
