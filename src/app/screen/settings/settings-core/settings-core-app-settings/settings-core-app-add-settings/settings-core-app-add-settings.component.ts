import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { AppState } from 'src/app/store/app-store.model';
import { SettingsActions } from '../../../settings.actions';
import { ApplicationSetting } from '../../../settings.model';

@Component({
  selector: 'app-settings-core-app-add-settings',
  templateUrl: './settings-core-app-add-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreAppAddSettingsComponent implements OnInit, OnDestroy, AfterViewInit {
  settingData: string = '{}';

  @ViewChild('settingsAddDialog') settingsAddDialogRef!: ElementRef;

  private readonly dialogClosedHandler: any;
  private readonly saveSettingHandler: any;
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store<AppState>, private readonly actions$: Actions, public readonly dialogRef: DialogRef, private readonly cdr: ChangeDetectorRef, @Inject(DIALOG_DATA) private readonly data: ApplicationSetting) {
    this.dialogClosedHandler = this.handleDialogClosed.bind(this);
    this.saveSettingHandler = this.handleSaveSetting.bind(this);

    this.settingData = JSON.stringify(this.data || {});
  }

  ngOnInit(): void {
    this.loadVueComponent();

    window.addEventListener('dialog-closed', this.dialogClosedHandler);
    window.addEventListener('save-setting', this.saveSettingHandler);

    this.actions$.pipe(ofType(SettingsActions.createApplicationSettingSuccess, SettingsActions.updateApplicationSettingSuccess), takeUntil(this.destroy$)).subscribe(() => {
      this.dialogRef.close();
      this.store.dispatch(
        SettingsActions.fetchApplicationSettings({
          params: { page: 1, per_page: 10 }
        })
      );
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initDialogComponent();
    }, 100);
  }

  private loadVueComponent(): void {
    if (!customElements.get('settings-app-add-dialog')) {
      const script = document.createElement('script');
      script.src = 'assets/vue-widget.js';
      script.type = 'module';

      script.onload = () => {
        console.log('Vue settings dialog component loaded');
        this.cdr.detectChanges();
        this.initDialogComponent();
      };

      script.onerror = error => {
        console.error('Failed to load Vue component:', error);
      };

      document.head.appendChild(script);
    }
  }

  private initDialogComponent(): void {
    if (!this.settingsAddDialogRef) {
      console.warn('Settings dialog element reference not found');
      return;
    }

    const dialogElement = this.settingsAddDialogRef.nativeElement;
    if (dialogElement) {
      console.log('Settings dialog element initialized');
    }
  }

  handleDialogClosed(): void {
    this.dialogRef.close();
  }

  handleSaveSetting(event: CustomEvent): void {
    if (!event.detail) return;

    try {
      const settingData = JSON.parse(event.detail);

      if (settingData.id) {
        this.store.dispatch(
          SettingsActions.updateApplicationSetting({
            id: settingData.id,
            body: settingData as ApplicationSetting
          })
        );
      } else {
        this.store.dispatch(
          SettingsActions.createApplicationSetting({
            body: settingData as ApplicationSetting
          })
        );
      }
    } catch (e) {
      console.error('Error processing setting data:', e);
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('dialog-closed', this.dialogClosedHandler);
    window.removeEventListener('save-setting', this.saveSettingHandler);

    this.destroy$.next();
    this.destroy$.complete();

    this.store.dispatch(SettingsActions.resetApplicationSetting());
  }
}
