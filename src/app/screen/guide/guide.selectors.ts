import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GUIDE_FEATURE_KEY, GuideState } from './guide.reducer';

export const selectGuideState = createFeatureSelector<GuideState>(GUIDE_FEATURE_KEY);

export const selectMenuItems = createSelector(selectGuideState, (state: GuideState) => state.menuItems);

export const selectActiveSlug = createSelector(selectGuideState, (state: GuideState) => state.activeSlug);

export const selectContent = createSelector(selectGuideState, (state: GuideState) => state.content);

export const selectIsLoading = createSelector(selectGuideState, (state: GuideState) => state.loading);

export const selectError = createSelector(selectGuideState, (state: GuideState) => state.error);
