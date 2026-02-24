import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { AlertActions } from 'src/app/store/alert/alert.actions';
import { AlertSelectors } from 'src/app/store/alert/alert.selectors';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertComponent implements OnInit, OnDestroy {
  alert$ = this.store.select(AlertSelectors.alert);
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getToastVariant(type: 'error' | 'success'): 'error' | 'success' {
    return type;
  }

  handleDismissed(): void {
    this.store.dispatch(AlertActions.hide());
  }
}
