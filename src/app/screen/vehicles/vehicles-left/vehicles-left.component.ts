import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  templateUrl: './vehicles-left.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesLeftComponent {
  isFiltersVisible = true;

  toggleFilters() {
    this.isFiltersVisible = !this.isFiltersVisible;
  }
}
