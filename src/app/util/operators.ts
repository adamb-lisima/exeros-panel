import { ofType } from '@ngrx/effects';
import { ActionCreator } from '@ngrx/store';
import { bufferCount, distinct, filter, first, map, Observable, pipe, take, UnaryFunction } from 'rxjs';

export function filterNullish<T>(): UnaryFunction<Observable<T | null | undefined>, Observable<T>> {
  return pipe(filter((value): value is T => value != null));
}

export function firstNonNullish<T>(): UnaryFunction<Observable<T | null | undefined>, Observable<T>> {
  return pipe(
    filter((value): value is T => value != null),
    take(1)
  );
}

export function firstNonEmpty<T>(): UnaryFunction<Observable<T[]>, Observable<T[]>> {
  return pipe(
    filter((value): value is T[] => value.length > 0),
    take(1)
  );
}

export function waitOnceForActions<AC extends ActionCreator>(waitFor: AC[]) {
  return pipe(
    ofType<AC>(...waitFor),
    distinct(action => action.type),
    bufferCount(waitFor.length),
    map(() => true),
    first()
  );
}

export function waitOnceForAction<AC extends ActionCreator>(waitFor: AC[]) {
  return pipe(
    ofType<AC>(...waitFor),
    distinct(action => action.type),
    bufferCount(1),
    map(() => true),
    first()
  );
}
