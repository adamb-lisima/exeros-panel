import { createAction, props } from '@ngrx/store';
import { IframeInput } from './iframe.model';

export const iframeSetInit = createAction('[Iframe] SetInit', props<{ input: IframeInput }>());
export const iframeReset = createAction('[Iframe] Reset');
