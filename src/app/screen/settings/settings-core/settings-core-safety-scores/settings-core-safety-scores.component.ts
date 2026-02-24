import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, map, Subject, Subscription, tap, withLatestFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TreeControl } from 'src/app/shared/component/control/tree-control/tree-control.model';
import ControlUtil from 'src/app/util/control';
import { filterNullish } from '../../../../util/operators';
import { SettingsActions } from '../../settings.actions';
import { CompanyElement, CompanyScoreProfile } from '../../settings.model';
import { SettingsSelectors } from '../../settings.selectors';
import { SafetyScoreAssignDialogData, SettingsCoreSafetyScoresAssignDialogComponent } from './settings-core-safety-scores-assign-dialog/settings-core-safety-scores-assign-dialog.component';
import { ScoreCreateDialogData, SettingsCoreSafetyScoresCreateDialogComponent } from './settings-core-safety-scores-create-dialog/settings-core-safety-scores-create-dialog.component';

interface FleetElement {
  name: string;
  profileId?: number;
}
@Component({
  selector: 'app-settings-core-safety-scores',
  templateUrl: './settings-core-safety-scores.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreSafetyScoresComponent implements OnInit, OnDestroy {
  private sub?: Subscription;
  companyElements$ = this.store.select(SettingsSelectors.companyElements);
  selectedCompany$ = new BehaviorSubject<CompanyElement | undefined>(undefined);
  fleetTree$ = this.store.select(SettingsSelectors.fleetsTree).pipe(map(data => ControlUtil.mapFleetsTreeToTreeControls(data)));
  selectedScoreProfile$ = new BehaviorSubject<CompanyScoreProfile | undefined>(undefined);
  branchesAssign$ = combineLatest([this.fleetTree$, this.selectedScoreProfile$]).pipe(map(([tree, scoreProfile]) => this.getAssignBranches(tree, scoreProfile)));
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store, private readonly dialog: Dialog) {}

  ngOnInit(): void {
    this.store.dispatch(SettingsActions.fetchCompaniesTree({ params: { with_users: false, with_drivers: false, with_score: true } }));

    this.sub = new Subscription();
    this.sub.add(
      this.selectedCompany$
        .pipe(
          filterNullish(),
          takeUntil(this.destroy$),
          map(company => company.id),
          tap(id => this.store.dispatch(SettingsActions.fetchFleetsTree({ params: { with_profiles: true, fleet_ids: undefined, show_vehicles: true, company_id: id } })))
        )
        .subscribe()
    );

    this.sub.add(
      this.companyElements$
        .pipe(
          tap(companies => {
            if (this.selectedCompany$.value) {
              return;
            }
            this.selectedCompany$.next(companies?.at(0));
          }),
          withLatestFrom(this.selectedScoreProfile$, this.selectedCompany$),
          takeUntil(this.destroy$),
          tap(([companies, selectedProfile, selectedCompany]) => {
            if (selectedProfile) {
              const company = companies.find(company => selectedCompany?.id === company.id);
              const newSelectedProfile = company?.score_profiles?.find(profile => profile.id === selectedProfile.id);
              this.selectedScoreProfile$.next(newSelectedProfile);
            }
          })
        )
        .subscribe()
    );
  }

  handleSelectCompanyClick(company: CompanyElement) {
    this.selectedCompany$.next(company);
    this.selectedScoreProfile$.next(undefined);
    this.store.dispatch(SettingsActions.fetchFleetsTree({ params: { with_profiles: true, fleet_ids: undefined, show_vehicles: true, company_id: company.id } }));
  }

  handleAssignScoringClick(treeControl: TreeControl[]) {
    this.dialog.open<void, SafetyScoreAssignDialogData>(SettingsCoreSafetyScoresAssignDialogComponent, {
      data: { tree: treeControl, profiles: this.selectedCompany$.value?.score_profiles ?? [] }
    });
  }

  handleCreateNewScoringClick(companyId: number) {
    this.dialog.open<void, ScoreCreateDialogData>(SettingsCoreSafetyScoresCreateDialogComponent, {
      data: {
        type: 'create',
        company_id: companyId
      }
    });
  }

  handleToggleDetailsClick(scoreProfile: CompanyScoreProfile) {
    const newScoreProfile = this.selectedScoreProfile$.value === scoreProfile ? undefined : scoreProfile;
    this.selectedScoreProfile$.next(newScoreProfile);
  }

  private getAssignBranches(tree: TreeControl[], scoreProfile?: CompanyScoreProfile): string[] {
    if (scoreProfile == null) {
      return [];
    }
    const id = scoreProfile.id;
    return this.prepareKeys(tree)
      .filter(element => element.profileId === id)
      .map(element => element.name);
  }

  private prepareKeys(data: TreeControl[]): FleetElement[] {
    return data.map(fleet => [this.prepareElement(fleet), ...this.prepareKeys(fleet.children ?? [])]).flatMap(v => [...v]);
  }

  private prepareElement(fleet: TreeControl): FleetElement {
    return {
      name: fleet.label,
      profileId: fleet.profile?.id
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
