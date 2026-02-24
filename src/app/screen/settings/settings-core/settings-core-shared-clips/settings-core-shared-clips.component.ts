import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { AppState } from '../../../../store/app-store.model';
import { SettingsActions } from '../../settings.actions';
import { AccessGroup, SharedClipsEmailsElement } from '../../settings.model';
import { SettingsSelectors } from '../../settings.selectors';
import { SettingsCoreSharedClipsEditDialogComponent } from './settings-core-notifications-edit-dialog/settings-core-shared-clips-edit-dialog.component';

@Component({
  selector: 'app-settings-core-shared-clips',
  templateUrl: './settings-core-shared-clips.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreSharedClipsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  sharedClipsEmails$ = this.store.select(SettingsSelectors.sharedClipsEmails);
  accessGroup = AccessGroup;
  selectedCompanyId?: number;
  companyElements$ = this.store.select(SettingsSelectors.companyElements);

  constructor(private readonly fb: FormBuilder, private readonly store: Store<AppState>, private readonly dialog: Dialog) {}

  ngOnInit(): void {
    this.store.dispatch(SettingsActions.fetchCompaniesTree({ params: { with_users: false, with_drivers: false, with_score: false } }));

    this.companyElements$.pipe(takeUntil(this.destroy$)).subscribe(companies => {
      if (companies && companies.length > 0 && !this.selectedCompanyId) {
        const firstCompany = companies[0];
        this.handleCompanyClick(firstCompany.id);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleCompanyClick(companyId: number | undefined) {
    this.selectedCompanyId = companyId;
    if (companyId) {
      this.store.dispatch(SettingsActions.fetchSharedClips({ company_id: companyId }));
    }
  }

  handleEditClick(settings: SharedClipsEmailsElement): void {
    this.dialog.open<void, SharedClipsEmailsElement>(SettingsCoreSharedClipsEditDialogComponent, {
      data: settings
    });
  }
}
