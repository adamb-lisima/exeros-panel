import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { filter, map, Subject, take } from 'rxjs';
import { SelectControl } from '../../../../../shared/component/control/select-control/select-control.model';
import { AppState } from '../../../../../store/app-store.model';
import { CommonObjectsService } from '../../../../../store/common-objects/common-objects.service';
import { SettingsActions } from '../../../settings.actions';
import { CreateAdminBody, AdminBody } from '../../../settings.model';
import { SettingsSelectors } from '../../../settings.selectors';
import { takeUntil } from 'rxjs/operators';

export interface AdminDialogData {
  adminId?: number;
  admin?: AdminBody;
}

@Component({
  selector: 'app-settings-core-admins-create-dialog',
  templateUrl: './settings-core-admins-create-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreAdminsCreateDialogComponent implements OnInit, OnDestroy {
  companyOptions$ = this.store.select(SettingsSelectors.companyElements).pipe(
    map((elements): SelectControl<number>[] =>
      elements.map(element => ({
        label: element.name,
        value: element.id
      }))
    )
  );
  adminDetail$ = this.store.select(SettingsSelectors.adminDetail);
  isEditMode = false;
  editAdminId?: number;

  private readonly destroy$ = new Subject<void>();

  form = this.fb.group({
    name: new FormControl<string>('', Validators.required),
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    company_ids: new FormControl<number[]>([], Validators.required)
  });

  ngOnInit(): void {
    setTimeout(() => {
      if (this.isEditMode && this.editAdminId) {
        this.store.dispatch(SettingsActions.fetchAdminDetail({ id: this.editAdminId }));

        this.adminDetail$
          .pipe(
            filter(admin => !!admin),
            take(1),
            takeUntil(this.destroy$)
          )
          .subscribe(admin => {
            if (admin) {
              this.loadAdminData(admin);
              this.cdr.detectChanges();
            }
          });
      } else {
        this.store.dispatch(SettingsActions.fetchCompaniesTree({ params: { with_users: true, with_drivers: false, with_score: false } }));
      }
    }, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.store.dispatch(SettingsActions.resetAdminDetail());
  }

  constructor(private readonly store: Store<AppState>, private readonly actions$: Actions, private readonly fb: FormBuilder, public readonly dialogRef: DialogRef, private readonly cdr: ChangeDetectorRef, private readonly commonObjectsService: CommonObjectsService, @Inject(DIALOG_DATA) private readonly data: AdminDialogData = {}) {
    this.store.dispatch(SettingsActions.resetAdminDetail());
    this.store.dispatch(SettingsActions.fetchCompaniesTree({ params: { with_users: true, with_drivers: false, with_score: false } }));

    setTimeout(() => {
      this.isEditMode = !!this.data.admin || !!this.data.adminId;

      if (this.data.admin) {
        this.editAdminId = this.data.admin.id;
      } else if (this.data.adminId) {
        this.editAdminId = this.data.adminId;
      }

      this.cdr.detectChanges();
    }, 0);

    this.actions$.pipe(ofType(SettingsActions.createAdminSuccess, SettingsActions.updateAdminSuccess), takeUntil(this.destroy$)).subscribe(() => {
      this.dialogRef.close();
    });
  }

  private loadAdminData(adminResponse: any): void {
    const admin = adminResponse.data;

    if (!admin) {
      console.error('Admin data is missing in the response');
      return;
    }

    this.editAdminId = admin.id;

    setTimeout(() => {
      this.form.get('name')?.setValue(admin.name ?? '');
      this.form.get('email')?.setValue(admin.email ?? '');
      this.form.get('company_ids')?.setValue(admin.company_ids ?? []);

      this.cdr.detectChanges();
    }, 300);
  }

  saveAdmin(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    const name = this.form.get('name')?.value ?? '';
    const email = this.form.get('email')?.value ?? '';
    const company_ids = this.form.get('company_ids')?.value ?? [];

    const body: CreateAdminBody = {
      name,
      email,
      company_ids
    };

    if (this.isEditMode && this.editAdminId) {
      this.store.dispatch(
        SettingsActions.updateAdmin({
          id: this.editAdminId,
          body
        })
      );
    } else {
      this.store.dispatch(SettingsActions.createAdmin({ body }));
    }
  }

  private markFormAsTouched() {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
    this.cdr.detectChanges();
  }
}
