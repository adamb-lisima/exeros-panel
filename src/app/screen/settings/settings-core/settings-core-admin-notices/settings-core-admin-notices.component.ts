import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { map, Subject, take } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SettingsActions } from '../../settings.actions';
import { InfotainmentParams } from '../../settings.model';
import { SettingsSelectors } from '../../settings.selectors';
import { SettingsCoreNewNoticesComponent } from './settings-core-new-notices/settings-core-new-notices.component';

@Component({
  selector: 'app-settings-core-admin-notices',
  templateUrl: './settings-core-admin-notices.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreAdminNoticesComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  infotainments$ = this.store.select(SettingsSelectors.infotainments);
  currentStatus: string | null = null;
  perPage$ = this.store.select(SettingsSelectors.infotainmentParams).pipe(map(params => params.per_page));
  constructor(private readonly store: Store, private readonly fb: FormBuilder, private readonly dialog: Dialog) {}

  handleCreateAdminNoticeClick(): void {
    this.dialog.open<void>(SettingsCoreNewNoticesComponent, {
      data: {}
    });
  }

  ngOnInit(): void {
    this.fetchInfotiments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchInfotiments(status?: string): void {
    const params: InfotainmentParams = {
      page: 1,
      per_page: 10
    };

    if (status) {
      params.status = status as any;
    }

    this.store.dispatch(SettingsActions.fetchInfotainments({ params }));
  }

  filterByStatus(status: string): void {
    this.currentStatus = status;

    const params: InfotainmentParams = {
      page: 1,
      per_page: 10,
      status: status as any
    };

    this.store.dispatch(SettingsActions.fetchInfotainments({ params }));
  }

  resetFilters(): void {
    const params: InfotainmentParams = {
      page: 1,
      per_page: 10,
      status: undefined
    };

    this.store.dispatch(SettingsActions.fetchInfotainments({ params }));

    this.currentStatus = null;
  }

  onPageChange(page: number) {
    this.store
      .select(SettingsSelectors.infotainmentParams)
      .pipe(
        take(1),
        takeUntil(this.destroy$),
        map(currentParams => {
          const newParams: InfotainmentParams = {
            ...currentParams,
            page: page
          };

          if (this.currentStatus) {
            newParams.status = this.currentStatus as any;
          }

          this.store.dispatch(SettingsActions.fetchInfotainments({ params: newParams }));
        })
      )
      .subscribe();
  }

  // onPageChangeSelect(page: number) {
  //   this.store.dispatch(
  //     SettingsActions.fetchReportItemResponse({
  //       params: {
  //         page
  //       }
  //     })
  //   );
  // }
}
