import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EventTypesGroup } from 'src/app/store/config/config.model';
import { ConfigSelectors } from 'src/app/store/config/config.selectors';
import { filterNullish, waitOnceForAction } from 'src/app/util/operators';
import { SettingsActions } from '../../../settings.actions';
import { CompanyScoreWeight } from '../../../settings.model';
import { ScoreProfileWeights, ScoreProfileWeightUtil } from '../settings-score-profile-utils';

export type ScoreCreateDialogData = { company_id: number } & ({ type: 'create' } | { type: 'edit'; profileWeights: CompanyScoreWeight[]; name: string; profileId: number });

type FormModel = {
  [key in string]: FormControl;
};

@Component({
  selector: 'app-settings-core-safety-scores-create-dialog',
  templateUrl: './settings-core-safety-scores-create-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreSafetyScoresCreateDialogComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  scoreProfileWights?: ScoreProfileWeights[];
  eventGroup: EventTypesGroup[] = [];
  title = '';
  form = this.fb.group<FormModel>({});
  formTitle = this.fb.control('', { validators: Validators.required });

  constructor(@Inject(DIALOG_DATA) public data: ScoreCreateDialogData, private readonly dialogRef: DialogRef, private readonly store: Store, private readonly fb: FormBuilder, private readonly actions$: Actions) {
    this.store
      .select(ConfigSelectors.data)
      .pipe(
        map(data => data?.event_types_groups),
        filterNullish(),
        map(eventsGroup => {
          if (this.data.type === 'edit') {
            this.scoreProfileWights = ScoreProfileWeightUtil.get(eventsGroup, this.data.profileWeights);
            this.title = 'Edit scoring';
            const form = this.getFormModel(eventsGroup, this.data.profileWeights);
            this.form = this.fb.group({
              ...form
            });
            this.formTitle.setValue(this.data.name);
          } else {
            this.title = 'Create new scoring';
            const form = this.getFormModel(eventsGroup);
            this.form = this.fb.group({
              ...form
            });
          }
          this.eventGroup = eventsGroup;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleSaveClick() {
    this.data.type === 'create' ? this.createScoreProfile() : this.editScoreProfile(this.data.profileId);
  }

  private createScoreProfile() {
    const weights = Object.entries(this.form.value).map(([key, value]) => ({
      event_type: key,
      group_id: 1,
      value: Number(Number(value).toFixed(2))
    }));

    this.store.dispatch(
      SettingsActions.createSafetyScoreProfile({
        body: {
          company_id: this.data.company_id,
          name: this.formTitle.value!,
          weights
        }
      })
    );
    this.actions$
      .pipe(
        waitOnceForAction([SettingsActions.createSafetyScoreProfileSuccess]),
        tap(() => this.dialogRef.close()),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private editScoreProfile(profileId: number) {
    const weights = Object.entries(this.form.value).map(([key, value]) => ({
      event_type: key,
      value: Number(Number(value).toFixed(2))
    }));
    this.store.dispatch(
      SettingsActions.updateSafetyScoreProfile({
        id: profileId,
        body: {
          company_id: this.data.company_id,
          name: this.formTitle.value!,
          weights
        }
      })
    );
    this.actions$
      .pipe(
        waitOnceForAction([SettingsActions.updateSafetyScoreProfileSuccess]),
        tap(() => this.dialogRef.close()),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private getFormModel(eventsGroup: EventTypesGroup[], profileWeights?: CompanyScoreWeight[]): FormModel {
    return eventsGroup
      .map(group => {
        return group.items
          .map(item => {
            const profile = profileWeights?.find(profile => profile.event_type === item.default_name);
            const value = profile?.value ? Number(profile.value.toFixed(2)) : 0;
            return {
              [item.default_name]: new FormControl(value, { validators: [Validators.min(-100), Validators.max(100), Validators.required] })
            };
          })
          .reduce((prev, curr) => {
            return { ...prev, ...curr };
          }, {});
      })
      .reduce((prev, curr) => {
        return { ...prev, ...curr };
      }, {});
  }
}
