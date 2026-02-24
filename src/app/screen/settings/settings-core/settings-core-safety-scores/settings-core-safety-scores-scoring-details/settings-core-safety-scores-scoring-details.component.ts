import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EventTypesGroup } from 'src/app/store/config/config.model';
import { ConfigSelectors } from 'src/app/store/config/config.selectors';
import { filterNullish } from 'src/app/util/operators';
import { SettingsActions } from '../../../settings.actions';
import { CompanyScoreProfile } from '../../../settings.model';
import { ScoreCreateDialogData, SettingsCoreSafetyScoresCreateDialogComponent } from '../settings-core-safety-scores-create-dialog/settings-core-safety-scores-create-dialog.component';
import { ScoreProfileWeights, ScoreProfileWeightUtil } from '../settings-score-profile-utils';

@Component({
  selector: 'app-settings-core-safety-scores-scoring-details',
  templateUrl: './settings-core-safety-scores-scoring-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreSafetyScoresScoringDetailsComponent implements OnInit, OnDestroy, OnChanges {
  destroy$ = new Subject<void>();
  private eventGroup: EventTypesGroup[] = [];
  scoreProfileWights?: ScoreProfileWeights[];

  @Input() scoreProfile?: CompanyScoreProfile;
  @Input() hasBranches = false;
  @Input() companyId?: number;

  constructor(private readonly store: Store, private readonly dialog: Dialog) {}

  ngOnInit(): void {
    this.store
      .select(ConfigSelectors.data)
      .pipe(
        map(data => data?.event_types_groups),
        filterNullish(),
        map(eventsGroup => {
          this.eventGroup = eventsGroup;
          this.scoreProfileWights = ScoreProfileWeightUtil.get(eventsGroup, this.scoreProfile?.safety_score_profile_weights!);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }
  ngOnChanges(changes: SimpleChanges): void {
    const newScoreProfile = changes['scoreProfile'].currentValue;
    this.scoreProfileWights = ScoreProfileWeightUtil.get(this.eventGroup, newScoreProfile.safety_score_profile_weights!);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleEditClick(): void {
    const profileWeights = this.scoreProfileWights?.map(score => score.weights).flatMap(score => [...score]);
    this.dialog.open<void, ScoreCreateDialogData>(SettingsCoreSafetyScoresCreateDialogComponent, {
      data: {
        type: 'edit',
        profileId: this.scoreProfile?.id!,
        company_id: this.companyId!,
        name: this.scoreProfile?.name ?? '',
        profileWeights: profileWeights ?? []
      }
    });
  }

  handleDeleteClick(): void {
    this.store.dispatch(SettingsActions.deleteSafetyScoreProfile({ id: this.scoreProfile?.id! }));
  }

  getLeftColumnProfiles() {
    if (!this.scoreProfileWights) return [];
    const half = Math.ceil(this.scoreProfileWights.length / 2);
    return this.scoreProfileWights.slice(0, half);
  }

  getRightColumnProfiles() {
    if (!this.scoreProfileWights) return [];
    const half = Math.ceil(this.scoreProfileWights.length / 2);
    return this.scoreProfileWights.slice(half);
  }
}
