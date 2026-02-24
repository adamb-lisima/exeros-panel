import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { GuideActions } from './guide.actions';
import { GuideService } from './guide.service';

@Injectable()
export class GuideEffects {
  loadGuideMenu$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GuideActions.loadGuideMenu),
      switchMap(() =>
        this.guideService.getMenu().pipe(
          map(menuItems => GuideActions.loadGuideMenuSuccess({ menuItems })),
          catchError(error => of(GuideActions.loadGuideMenuFailure({ error: error.message })))
        )
      )
    )
  );

  loadGuideContent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GuideActions.loadGuideContent),
      switchMap(({ slug }) =>
        this.guideService.getContent(slug).pipe(
          map(content => {
            if (!content) {
              return GuideActions.loadGuideContentFailure({
                error: `Content for slug "${slug}" not found`
              });
            }
            return GuideActions.loadGuideContentSuccess({ content });
          }),
          catchError(error =>
            of(
              GuideActions.loadGuideContentFailure({
                error: error.message
              })
            )
          )
        )
      )
    )
  );

  constructor(private readonly actions$: Actions, private readonly guideService: GuideService) {}
}
