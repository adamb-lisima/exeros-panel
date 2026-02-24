import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SettingsActions } from '../../settings.actions';
import { SettingsSelectors } from '../../settings.selectors';
import { SettingsCoreAppAddSettingsComponent } from './settings-core-app-add-settings/settings-core-app-add-settings.component';
import { ApplicationSetting } from '../../settings.model';

@Component({
  selector: 'app-settings-core-app-settings',
  templateUrl: './settings-core-app-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreAppSettingsComponent implements OnInit, OnDestroy {
  appSettings$ = this.store.select(SettingsSelectors.applicationSettingsResponse);
  perPage$ = this.store.select(SettingsSelectors.applicationSettingsParams);

  appSettingsData: string = '[]';
  perPageData: string = '10';
  currentPageValue: string = '1';

  @ViewChild('appSettingsList') appSettingsListRef!: ElementRef;

  private readonly pageChangeHandler: any;
  private readonly createSettingHandler: any;
  private readonly editSettingHandler: any;
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store, private readonly dialog: Dialog, private readonly cdr: ChangeDetectorRef) {
    this.pageChangeHandler = this.handlePageChange.bind(this);
    this.createSettingHandler = this.handleCreateClick.bind(this);
    this.editSettingHandler = this.handleEditClick.bind(this);
  }

  ngOnInit(): void {
    this.loadVueComponent();

    window.addEventListener('page-change', this.pageChangeHandler);
    window.addEventListener('create-setting', this.createSettingHandler);
    window.addEventListener('edit-setting', this.editSettingHandler);

    this.appSettings$.pipe(takeUntil(this.destroy$)).subscribe(settings => {
      if (settings) {
        this.appSettingsData = JSON.stringify(settings);
        this.cdr.detectChanges();
      }
    });

    this.perPage$.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params) {
        this.perPageData = params.per_page.toString();
        this.currentPageValue = params.page?.toString() ?? '1';
        this.cdr.detectChanges();
      }
    });

    this.fetchMobileApplicationsSettings();
  }

  ngOnDestroy(): void {
    window.removeEventListener('page-change', this.pageChangeHandler);
    window.removeEventListener('create-setting', this.createSettingHandler);
    window.removeEventListener('edit-setting', this.editSettingHandler);
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadVueComponent(): void {
    if (!customElements.get('settings-core-app-settings-list')) {
      const script = document.createElement('script');
      script.src = 'assets/vue-widget.js';
      script.type = 'module';

      document.head.appendChild(script);
    }
  }

  fetchMobileApplicationsSettings() {
    this.store.dispatch(
      SettingsActions.fetchApplicationSettings({
        params: {
          page: 1,
          per_page: 10
        }
      })
    );
  }

  handlePageChange(event: CustomEvent): void {
    if (!event.detail) return;

    const page = Number(event.detail);
    if (isNaN(page)) return;

    this.store.dispatch(
      SettingsActions.fetchApplicationSettings({
        params: {
          page,
          per_page: 10
        }
      })
    );
  }

  handleCreateClick(): void {
    this.dialog.open(SettingsCoreAppAddSettingsComponent, {
      data: {} as ApplicationSetting
    });
  }

  handleEditClick(event: CustomEvent): void {
    if (!event.detail) return;

    try {
      const setting = JSON.parse(event.detail);

      this.store.dispatch(
        SettingsActions.fetchApplicationSettingByName({
          name: setting.name
        })
      );

      this.dialog.open(SettingsCoreAppAddSettingsComponent, {
        data: setting
      });
    } catch (e) {
      console.error('Error parsing setting data:', e);
    }
  }
}
