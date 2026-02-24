import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { GuideContent, GuideMenuItem } from './guide.model';

export const GuideActions = createActionGroup({
  source: 'Guide',
  events: {
    'Set Active Slug': props<{ slug: string }>(),
    'Load Guide Menu': emptyProps(),
    'Load Guide Menu Success': props<{ menuItems: GuideMenuItem[] }>(),
    'Load Guide Menu Failure': props<{ error: string }>(),
    'Load Guide Content': props<{ slug: string }>(),
    'Load Guide Content Success': props<{ content: GuideContent }>(),
    'Load Guide Content Failure': props<{ error: string }>()
  }
});
