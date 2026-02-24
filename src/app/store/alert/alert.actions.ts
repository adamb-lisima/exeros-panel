import { createAction, props } from '@ngrx/store';
import { Alert } from 'src/app/store/alert/alert.model';

export const AlertActions = {
  display: createAction('[Alert] Display', props<{ alert: Alert }>()),
  hide: createAction('[Alert] Hide'),
  reset: createAction('[Alert] Reset')
};
