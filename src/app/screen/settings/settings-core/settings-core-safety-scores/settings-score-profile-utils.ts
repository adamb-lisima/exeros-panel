import { EventTypesGroup } from 'src/app/store/config/config.model';
import { CompanyScoreWeight } from '../../settings.model';

export type ScoreProfileWeights = { name: string; weights: CompanyScoreWeight[] };

export const ScoreProfileWeightUtil = {
  get(eventsGroup: EventTypesGroup[], scoreWeights: CompanyScoreWeight[]): ScoreProfileWeights[] {
    return eventsGroup.map(group => {
      const weights = scoreWeights.filter(score =>
        group.items
          .map(item => {
            return item.default_name;
          })
          .includes(score.event_type)
      ); //todo: chyba done
      return { name: group.name, weights };
    });
  }
};
