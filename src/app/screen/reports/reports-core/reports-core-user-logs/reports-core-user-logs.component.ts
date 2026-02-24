import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { combineLatest, map, Subject, Subscription, takeUntil, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { SelectControl } from '../../../../shared/component/control/select-control/select-control.model';
import { AppState } from '../../../../store/app-store.model';
import { AuthSelectors } from '../../../../store/auth/auth.selectors';
import { ConfigSelectors } from '../../../../store/config/config.selectors';
import { SettingsActions } from '../../../settings/settings.actions';
import { AccessGroup } from '../../../settings/settings.model';
import { SettingsSelectors } from '../../../settings/settings.selectors';
import { ReportsActions } from '../../reports.actions';
import { ReportsSelectors } from '../../reports.selectors';

@Component({
  selector: 'app-reports-core-user-logs',
  templateUrl: './reports-core-user-logs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsCoreUserLogsComponent implements OnInit, OnDestroy {
  readonly SHOW_EXPORT_WITHOUT_FILTERS = environment.reportsAlarmsShowExportWithoutFilters;
  readonly orderControl = this.fb.control<'asc' | 'desc'>('asc');
  readonly companyControl = this.fb.control<number | null>(null);
  readonly userControl = this.fb.control<number[] | null>(null);
  readonly logTypeControl = this.fb.control<string[] | null>(null);
  configData$ = this.store.select(ConfigSelectors.data);

  readonly orderOptions: SelectControl[] = [
    { value: 'desc' as const, label: 'Newest' },
    { value: 'asc' as const, label: 'Oldest' }
  ];
  accessGroup = AccessGroup;
  private readonly sub = new Subscription();
  private readonly destroy$ = new Subject<void>();
  userLogsLoading$ = this.store.select(ReportsSelectors.userLogsLoading);
  userLogs$ = this.store.select(ReportsSelectors.userLogs);

  companyOptions$ = this.store.select(SettingsSelectors.companyElements).pipe(
    map((elements): SelectControl<number>[] =>
      elements.map(element => ({
        label: element.name,
        value: element.id
      }))
    )
  );
  userOptions$ = this.store.select(SettingsSelectors.usersTree).pipe(
    map((elements): SelectControl<number>[] =>
      elements.map(element => ({
        label: element.name,
        value: element.id
      }))
    )
  );

  constructor(private readonly store: Store<AppState>, private readonly fb: NonNullableFormBuilder) {}

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  logTypeOptions$ = combineLatest([this.configData$]).pipe(
    map(([configData]) => {
      if (!configData?.log_types) {
        return [];
      }

      const options = configData.log_types;

      return options
        ? options.map(element => ({
            label: element.replace(/_/g, ' '),
            value: element
          }))
        : [];
    })
  );

  private fetchData(): void {
    const filters = {
      order: this.orderControl.value,
      company_id: this.companyControl.value,
      user_ids: Array.isArray(this.userControl.value) ? this.userControl.value.join(',') : this.userControl.value,
      log_types: Array.isArray(this.logTypeControl.value) ? this.logTypeControl.value.join(',') : this.logTypeControl.value
    };

    this.store.dispatch(ReportsActions.fetchUserLogs({ params: filters }));
  }

  handleUserLogsExport(): void {
    this.store.dispatch(ReportsActions.exportUserLogs());
  }
  ngOnInit(): void {
    this.fetchData();

    this.sub.add(
      this.store
        .select(ReportsSelectors.rangeFilter)
        .pipe(
          tap(() => this.fetchData()),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );

    this.sub.add(
      this.orderControl.valueChanges
        .pipe(
          tap(() => this.fetchData()),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );

    this.sub.add(
      this.companyControl.valueChanges
        .pipe(
          tap(() => this.fetchData()),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );

    this.sub.add(
      this.userControl.valueChanges
        .pipe(
          tap(() => this.fetchData()),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );

    this.sub.add(
      this.logTypeControl.valueChanges
        .pipe(
          tap(() => this.fetchData()),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );

    this.store.dispatch(
      SettingsActions.fetchUsersTree({
        params: {
          roles: undefined,
          ignored_roles: 'DRIVER'
        }
      })
    );

    this.sub.add(
      this.store
        .select(AuthSelectors.isSuperAdmin)
        .pipe(
          tap(isSuperAdmin => {
            if (isSuperAdmin) {
              this.store.dispatch(
                SettingsActions.fetchCompaniesTree({
                  params: {
                    with_users: true,
                    with_drivers: false,
                    with_score: false
                  }
                })
              );
            }
          }),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );
  }
}
