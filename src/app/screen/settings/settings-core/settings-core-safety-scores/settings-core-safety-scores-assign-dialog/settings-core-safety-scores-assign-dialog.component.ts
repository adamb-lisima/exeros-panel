import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SelectControl } from 'src/app/shared/component/control/select-control/select-control.model';
import { TreeControl } from 'src/app/shared/component/control/tree-control/tree-control.model';
import { waitOnceForAction } from 'src/app/util/operators';
import { SettingsActions } from '../../../settings.actions';
import { CompanyScoreProfile } from '../../../settings.model';

export interface SafetyScoreAssignDialogData {
  tree: TreeControl[];
  profiles: CompanyScoreProfile[];
}

interface TreeElement {
  id: number;
  profile?: number;
}

type DataModel = {
  [key in string]: number | undefined;
};

@Component({
  selector: 'app-settings-core-safety-scores-assign-dialog',
  templateUrl: './settings-core-safety-scores-assign-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreSafetyScoresAssignDialogComponent implements OnDestroy {
  destroy$ = new Subject<void>();
  options: SelectControl[] = [];
  form = this.fb.group<DataModel>({});
  rootData: DataModel = {};

  constructor(@Inject(DIALOG_DATA) public data: SafetyScoreAssignDialogData, private readonly dialogRef: DialogRef, private readonly store: Store, private readonly actions$: Actions, private readonly fb: FormBuilder) {
    this.options = this.data.profiles.map(
      (profile): SelectControl => ({
        label: profile.name,
        value: profile.id
      })
    );
    const keys: DataModel = this.prepareKeys(this.data.tree)
      .map(key => ({
        [key.id]: key.profile
      }))
      .reduce((prev, curr) => ({ ...prev, ...curr }), {});
    this.form = this.fb.group<DataModel>({
      ...keys
    });
    this.rootData = keys;
  }

  handleSaveClick() {
    const fleetsToSave = Object.entries(this.form.value)
      .filter(([key, value]) => this.rootData[key] != value)
      .map(([key, value]) => ({
        fleetId: Number(key),
        profileId: value as number
      }));
    const counter = fleetsToSave.length;

    if (counter > 0) {
      let index = 0;
      const { fleetId, profileId } = fleetsToSave[index];
      this.assignProfile(fleetId, profileId);
      this.actions$
        .pipe(
          waitOnceForAction([SettingsActions.assignSafetyScoreProfileSuccess]),
          tap(() => {
            index++;
            if (index < counter) {
              const { fleetId, profileId } = fleetsToSave[index];
              this.assignProfile(fleetId, profileId);
            } else {
              this.dialogRef.close();
            }
          }),
          takeUntil(this.destroy$)
        )
        .subscribe();
    }
  }

  private assignProfile(fleetId: number, profileId: number): void {
    this.store.dispatch(SettingsActions.assignSafetyScoreProfile({ profileId: profileId, fleetId: fleetId }));
  }

  private prepareKeys(data: TreeControl[]): TreeElement[] {
    return data.map(fleet => [this.prepareElement(fleet), ...this.prepareKeys(fleet.children ?? [])]).flatMap(v => [...v]);
  }

  private prepareElement(fleet: TreeControl): TreeElement {
    return {
      id: fleet.value as number,
      profile: fleet.profile?.id
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
