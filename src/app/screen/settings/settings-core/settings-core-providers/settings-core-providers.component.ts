import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { SettingsActions } from '../../settings.actions';
import { SettingsSelectors } from '../../settings.selectors';
import { ProviderDialogData, SettingsCoreProvidersCreateProviderDialogComponent } from './settings-core-providers-create-provider-dialog/settings-core-providers-create-provider-dialog.component';

@Component({
  selector: 'app-settings-core-providers',
  templateUrl: './settings-core-providers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreProvidersComponent implements OnInit {
  providers$ = this.store.select(SettingsSelectors.providersResponse);
  perPage$ = this.store.select(SettingsSelectors.providerResponseParams).pipe(map(params => params.per_page));
  currentPage = 1;

  ngOnInit() {
    this.loadProviders();
  }

  constructor(private readonly store: Store, private readonly dialog: Dialog) {}

  loadProviders() {
    this.store.dispatch(
      SettingsActions.fetchProvidersList({
        params: {
          page: 1
        }
      })
    );
  }

  handleCreateProviderClick(): void {
    this.dialog.open<void, ProviderDialogData>(SettingsCoreProvidersCreateProviderDialogComponent, {
      data: {}
    });
  }

  handleUpdateProvider(providerId: number): void {
    this.dialog.open<void, ProviderDialogData>(SettingsCoreProvidersCreateProviderDialogComponent, {
      data: { providerId }
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.store.dispatch(
      SettingsActions.fetchProvidersList({
        params: {
          page
        }
      })
    );
  }
}
