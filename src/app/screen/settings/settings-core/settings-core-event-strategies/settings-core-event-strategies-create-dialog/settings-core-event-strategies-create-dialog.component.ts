import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { waitOnceForAction } from 'src/app/util/operators';
import { SettingsActions } from '../../../settings.actions';
import { ALARM_TYPES } from '../../../settings.model';
import { SettingsSelectors } from '../../../settings.selectors';

export interface EditEventStrategyData {
  type: 'create' | 'edit';
  id?: number;
}

@Component({
  selector: 'app-settings-core-event-strategies-create-dialog',
  templateUrl: './settings-core-event-strategies-create-dialog.component.html'
})
export class SettingsCoreEventStrategiesCreateDialogComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  loading = false;
  private readonly destroy$ = new Subject<void>();

  alarmTypes = ALARM_TYPES;
  alarmTypeOptions = ALARM_TYPES.map(type => ({ label: type.name, value: type.id }));

  constructor(private readonly fb: FormBuilder, public dialogRef: MatDialogRef<SettingsCoreEventStrategiesCreateDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: EditEventStrategyData, private readonly store: Store, private readonly actions$: Actions) {}

  ngOnInit(): void {
    this.initForm();

    if (this.data.type === 'edit' && this.data.id) {
      this.loading = true;
      this.store.dispatch(SettingsActions.fetchEventStrategy({ id: this.data.id }));

      this.store
        .select(SettingsSelectors.eventStrategy)
        .pipe(takeUntil(this.destroy$))
        .subscribe(strategy => {
          if (strategy) {
            this.form.patchValue(strategy);
            this.loading = false;
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(SettingsActions.fetchEventStrategyReset());
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      alarm_type_id: [null, Validators.required],
      main_stream: [false],
      sub_stream: [false],
      time_before: [5, [Validators.required, Validators.min(0)]],
      time_after: [5, [Validators.required, Validators.min(0)]],
      bbox_gps: [false],
      bbox_log: [false],
      bbox_acc: [false],
      bbox: [''],
      video_channel: [''],
      pic_channel: [''],
      status: [0],
      flag: [0],
      cmd_type: [0],
      remark: [''],
      interval_sec: [0],
      alarm_count: [0]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.loading = true;
      const formValue = this.form.value;

      if (this.data.type === 'edit' && this.data.id) {
        this.store.dispatch(
          SettingsActions.updateEventStrategy({
            id: this.data.id,
            body: formValue
          })
        );

        this.actions$.pipe(waitOnceForAction([SettingsActions.updateEventStrategySuccess]), takeUntil(this.destroy$)).subscribe(() => {
          this.store.dispatch(SettingsActions.fetchEventStrategiesResponse({ params: { page: 1 } }));
          this.dialogRef.close(true);
        });
      } else {
        this.store.dispatch(
          SettingsActions.createEventStrategy({
            body: formValue
          })
        );

        this.actions$.pipe(waitOnceForAction([SettingsActions.createEventStrategySuccess]), takeUntil(this.destroy$)).subscribe(() => {
          this.store.dispatch(SettingsActions.fetchEventStrategiesResponse({ params: { page: 1 } }));
          this.dialogRef.close(true);
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  get isEdit(): boolean {
    return this.data.type === 'edit';
  }

  get title(): string {
    return this.isEdit ? 'Edit Event Strategy' : 'Create Event Strategy';
  }
}
