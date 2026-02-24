import { Pipe, PipeTransform } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { AppState } from '../../../store/app-store.model';
import { ConfigData } from '../../../store/config/config.model';
import { ConfigSelectors } from '../../../store/config/config.selectors';
import { filterNullish } from '../../../util/operators';

@Pipe({
  name: 'unitAdder'
})
export class UnitAdderPipe implements PipeTransform {
  constructor(private readonly store: Store<AppState>) {}

  transform(value: number | string, decimal?: boolean): Observable<{ value: number; unit: ConfigData['speed_unit'] }> {
    return this.store.select(ConfigSelectors.data).pipe(
      filterNullish(),
      map(data => ({
        value: this.getValue(value, data, decimal ?? false),
        unit: data.speed_unit
      }))
    );
  }

  private getValue(value: number | string, data: ConfigData, decimal: boolean): number {
    const speed = Number(value);
    return decimal ? speed : Math.round(speed);
  }
}
