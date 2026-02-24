import { ActivationEnd, NavigationEnd, Router } from '@angular/router';
import { buffer, filter, map, Observable, throttleTime } from 'rxjs';

const RoutingUtil = {
  mergeParams: <Params>(router: Router): Observable<Params> => {
    return router.events.pipe(
      filter((event): event is ActivationEnd => event instanceof ActivationEnd),
      buffer(router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))),
      map((events: ActivationEnd[]): Params => events.reduce((acc, curr) => ({ ...acc, ...curr.snapshot.params }), {} as Params))
    );
  },
  mergeQueryParams: <QueryParams>(router: Router): Observable<QueryParams> => {
    return router.events.pipe(
      filter((event): event is ActivationEnd => event instanceof ActivationEnd),
      buffer(router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))),
      map((events: ActivationEnd[]): QueryParams => events.reduce((acc, curr) => ({ ...acc, ...curr.snapshot.queryParams }), {} as QueryParams))
    );
  },
  getData: <Data>(router: Router): Observable<Data> => {
    return router.events.pipe(
      filter((event): event is ActivationEnd => event instanceof ActivationEnd),
      throttleTime(0),
      map(event => event.snapshot.data as Data)
    );
  }
};

export default RoutingUtil;
