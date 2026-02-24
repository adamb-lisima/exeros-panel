import { createAction, props } from '@ngrx/store';

export const applicationLoading = createAction('[Application] Loading', props<{ loading: boolean; key: string }>());
export const applicationReset = createAction('[Application] Reset');
