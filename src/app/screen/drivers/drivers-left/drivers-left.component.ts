import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  templateUrl: './drivers-left.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriversLeftComponent {
  isFiltersVisible = true;

  toggleFilters() {
    this.isFiltersVisible = !this.isFiltersVisible;
  }
}
