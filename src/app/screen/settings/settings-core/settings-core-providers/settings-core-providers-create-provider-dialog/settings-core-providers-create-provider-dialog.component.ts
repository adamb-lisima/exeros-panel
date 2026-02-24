import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { filter, map, Subject, take } from 'rxjs';
import { HumanizePipe } from '../../../../../shared/pipe/humanize/humanize.pipe';
import { AppState } from '../../../../../store/app-store.model';
import { CommonObjectsService } from '../../../../../store/common-objects/common-objects.service';
import { ConfigSelectors } from '../../../../../store/config/config.selectors';
import { SettingsActions } from '../../../settings.actions';
import { CreateProviderBody, ProviderBody, ProviderSelectControl, ProviderType } from '../../../settings.model';
import { SettingsSelectors } from '../../../settings.selectors';
import { takeUntil } from 'rxjs/operators';

export interface ProviderDialogData {
  providerId?: number;
  provider?: ProviderBody;
}

@Component({
  selector: 'app-settings-core-providers-create-provider-dialog',
  templateUrl: './settings-core-providers-create-provider-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreProvidersCreateProviderDialogComponent implements OnInit, OnDestroy {
  providerType = ProviderType;
  providerOptions$ = this.store.select(ConfigSelectors.data).pipe(
    map(
      (data): ProviderSelectControl[] =>
        data?.providers.map(provider => ({
          value: provider.id,
          label: this.humanize.transform(provider.name),
          type: provider.type
        })) ?? []
    )
  );
  providerDetail$ = this.store.select(SettingsSelectors.providerDetail);
  isEditMode = false;
  editProviderId?: number;

  private readonly destroy$ = new Subject<void>();

  private readonly humanize = new HumanizePipe();

  form = this.fb.group({
    providerId: new FormControl<number | null>(null, Validators.required),
    name: new FormControl<string>('', Validators.required),

    api_login: new FormControl<string>(''),
    api_password: new FormControl<string>(''),
    domain: new FormControl<string>(''),
    mongo_host: new FormControl<string>(''),
    mongo_port: new FormControl<number | null>(null),
    mongo_database: new FormControl<string>(''),
    mongo_username: new FormControl<string>(''),
    mongo_password: new FormControl<string>(''),
    host: new FormControl<string>(''),
    port: new FormControl<number | null>(null),
    database: new FormControl<string>(''),
    username: new FormControl<string>(''),
    password: new FormControl<string>(''),

    flespi_provider_url: new FormControl<string>(''),
    ft_cloud_provider_url: new FormControl<string>('')
  });

  ngOnInit(): void {
    setTimeout(() => {
      if (this.isEditMode && this.editProviderId) {
        this.store.dispatch(SettingsActions.fetchProviderDetail({ id: this.editProviderId }));

        this.providerDetail$
          .pipe(
            filter(provider => !!provider),
            take(1),
            takeUntil(this.destroy$)
          )
          .subscribe(provider => {
            if (provider) {
              this.loadProviderData(provider);
              this.cdr.detectChanges();
            }
          });
      }
    }, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.store.dispatch(SettingsActions.resetProviderDetail());
  }

  get selectedProviderType(): string | null {
    const providerId = this.form.get('providerId')?.value;
    if (!providerId) return null;

    let providerType: string | null = null;
    this.providerOptions$.pipe(take(1), takeUntil(this.destroy$)).subscribe(options => {
      const provider = options.find(opt => opt.value === providerId);
      providerType = provider?.type ?? null;
    });

    return providerType;
  }

  constructor(private readonly store: Store<AppState>, private readonly actions$: Actions, private readonly fb: FormBuilder, public readonly dialogRef: DialogRef, private readonly cdr: ChangeDetectorRef, private readonly commonObjectsService: CommonObjectsService, @Inject(DIALOG_DATA) private readonly data: ProviderDialogData = {}) {
    this.store.dispatch(SettingsActions.resetProviderDetail());
    this.resetForm();

    setTimeout(() => {
      this.isEditMode = !!this.data.provider || !!this.data.providerId;

      if (this.data.provider) {
        this.editProviderId = this.data.provider.id;
      } else if (this.data.providerId) {
        this.editProviderId = this.data.providerId;
      }

      this.cdr.detectChanges();
    }, 0);

    this.form
      .get('providerId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(providerId => {
        this.updateValidators();
        this.cdr.detectChanges();
      });

    this.actions$.pipe(ofType(SettingsActions.createProviderSuccess, SettingsActions.updateProviderSuccess), takeUntil(this.destroy$)).subscribe(() => {
      this.dialogRef.close();
    });
  }

  private loadProviderData(providerResponse: any): void {
    const provider = providerResponse.data;

    if (!provider) {
      console.error('Provider data is missing in the response');
      return;
    }

    this.editProviderId = provider.id;

    this.form.get('providerId')?.setValue(provider.id);

    this.form.get('name')?.setValue(provider.name);

    if (provider.settings) {
      const settings = provider.settings;

      if (provider.type === 'STREAMAX') {
        this.form.get('api_login')?.setValue(settings.api_login ?? '');
        this.form.get('api_password')?.setValue(settings.api_password ?? '');
        this.form.get('domain')?.setValue(settings.domain ?? '');
        this.form.get('mongo_host')?.setValue(settings.mongo_host ?? '');
        this.form.get('mongo_port')?.setValue(settings.mongo_port ?? null);
        this.form.get('mongo_database')?.setValue(settings.mongo_database ?? '');
        this.form.get('mongo_username')?.setValue(settings.mongo_username ?? '');
        this.form.get('mongo_password')?.setValue(settings.mongo_password ?? '');
        this.form.get('host')?.setValue(settings.host ?? '');
        this.form.get('port')?.setValue(settings.port ?? null);
        this.form.get('database')?.setValue(settings.database ?? '');
        this.form.get('username')?.setValue(settings.username ?? '');
        this.form.get('password')?.setValue(settings.password ?? '');
      } else if (provider.type === 'FLESPI') {
        this.form.get('flespi_provider_url')?.setValue(settings.flespi_provider_url ?? '');
      } else if (provider.type === 'FT_CLOUD') {
        this.form.get('ft_cloud_provider_url')?.setValue(settings.ft_cloud_provider_url ?? '');
      }
    }

    if (this.isEditMode) {
      this.form.get('providerId')?.disable();
    }

    this.cdr.detectChanges();
  }

  private updateValidators(): void {
    this.resetValidators();

    const type = this.selectedProviderType;
    if (!type) return;

    switch (type) {
      case 'STREAMAX':
        this.form.get('api_login')?.setValidators(Validators.required);
        this.form.get('api_password')?.setValidators(Validators.required);
        this.form.get('domain')?.setValidators(Validators.required);
        this.form.get('mongo_database')?.setValidators(Validators.required);
        this.form.get('host')?.setValidators(Validators.required);
        this.form.get('port')?.setValidators(Validators.required);
        this.form.get('database')?.setValidators(Validators.required);
        this.form.get('username')?.setValidators(Validators.required);
        this.form.get('password')?.setValidators(Validators.required);
        break;
      case 'FLESPI':
        this.form.get('flespi_provider_url')?.setValidators(Validators.required);
        break;
      case 'FT_CLOUD':
        this.form.get('ft_cloud_provider_url')?.setValidators(Validators.required);
        break;
    }

    this.form.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  private resetValidators(): void {
    const fieldsToReset = ['api_login', 'api_password', 'domain', 'mongo_host', 'mongo_port', 'mongo_database', 'mongo_username', 'mongo_password', 'host', 'port', 'database', 'username', 'password', 'flespi_provider_url'];

    fieldsToReset.forEach(field => {
      this.form.get(field)?.clearValidators();
      this.form.get(field)?.updateValueAndValidity();
    });
  }

  saveProvider(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    const type = this.selectedProviderType;
    if (!type) return;

    const name = this.form.get('name')?.value ?? '';

    let settings: any = {};
    switch (type) {
      case 'STREAMAX':
        settings = {
          api_login: this.form.get('api_login')?.value ?? '',
          api_password: this.form.get('api_password')?.value ?? '',
          domain: this.form.get('domain')?.value ?? '',
          mongo_host: this.form.get('mongo_host')?.value ?? '',
          mongo_port: this.form.get('mongo_port')?.value ?? 0,
          mongo_database: this.form.get('mongo_database')?.value ?? '',
          mongo_username: this.form.get('mongo_username')?.value ?? '',
          mongo_password: this.form.get('mongo_password')?.value ?? '',
          host: this.form.get('host')?.value ?? '',
          port: this.form.get('port')?.value ?? 0,
          database: this.form.get('database')?.value ?? '',
          username: this.form.get('username')?.value ?? '',
          password: this.form.get('password')?.value ?? ''
        };
        break;
      case 'FLESPI':
        settings = {
          flespi_provider_url: this.form.get('flespi_provider_url')?.value ?? ''
        };
        break;
      case 'FT_CLOUD':
        settings = {
          FT_CLOUD_provider_url: this.form.get('ft_cloud_provider_url')?.value ?? ''
        };
        break;
      case 'MANUAL':
      case 'ANALYTIC':
        settings = {};
        break;
    }

    const body: CreateProviderBody = {
      name,
      type: type as ProviderType,
      settings
    };

    if (this.isEditMode && this.editProviderId) {
      this.store.dispatch(
        SettingsActions.updateProvider({
          id: this.editProviderId,
          body
        })
      );
    } else {
      this.store.dispatch(SettingsActions.createProvider({ body }));
    }
  }

  private resetForm(): void {
    this.form.reset();

    this.form.get('providerId')?.setValue(null);
    this.form.get('name')?.setValue('');

    this.form.get('api_login')?.setValue('');
    this.form.get('api_password')?.setValue('');
    this.form.get('domain')?.setValue('');
    this.form.get('mongo_host')?.setValue('');
    this.form.get('mongo_port')?.setValue(null);
    this.form.get('mongo_database')?.setValue('');
    this.form.get('mongo_username')?.setValue('');
    this.form.get('mongo_password')?.setValue('');
    this.form.get('host')?.setValue('');
    this.form.get('port')?.setValue(null);
    this.form.get('database')?.setValue('');
    this.form.get('username')?.setValue('');
    this.form.get('password')?.setValue('');

    this.form.get('flespi_provider_url')?.setValue('');

    this.resetValidators();

    this.form.markAsPristine();
    this.form.markAsUntouched();

    this.form.updateValueAndValidity();
  }

  protected readonly ProviderType = ProviderType;
}
