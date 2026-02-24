import { createReducer, on } from '@ngrx/store';
import { GuideActions } from './guide.actions';
import { GuideContent, GuideMenuItem } from './guide.model';

export const GUIDE_FEATURE_KEY = 'guide';

export interface GuideState {
  menuItems: GuideMenuItem[];
  activeSlug: string | null;
  content: GuideContent | null;
  loading: boolean;
  error: string | null;
}

export const initialGuideState: GuideState = {
  menuItems: [],
  activeSlug: null,
  content: null,
  loading: false,
  error: null
};

export const guideReducer = createReducer(
  initialGuideState,
  on(GuideActions.setActiveSlug, (state, { slug }) => ({
    ...state,
    activeSlug: slug
  })),
  on(GuideActions.loadGuideMenu, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(GuideActions.loadGuideMenuSuccess, (state, { menuItems }) => ({
    ...state,
    menuItems,
    loading: false
  })),
  on(GuideActions.loadGuideMenuFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(GuideActions.loadGuideContent, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(GuideActions.loadGuideContentSuccess, (state, { content }) => ({
    ...state,
    content,
    loading: false
  })),
  on(GuideActions.loadGuideContentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);
