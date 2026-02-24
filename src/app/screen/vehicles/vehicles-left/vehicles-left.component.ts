import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { VehiclesLeftSearchComponent } from './vehicles-left-search/vehicles-left-search.component';

@Component({
  templateUrl: './vehicles-left.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesLeftComponent {
  @ViewChild('searchComponent') searchComponent?: VehiclesLeftSearchComponent;

  isFiltersVisible = true;
  activeFilterCount = 0;
  activeFilterChips: string[] = [];

  toggleFilters(): void {
    this.isFiltersVisible = !this.isFiltersVisible;
  }

  handleClearFilters(): void {
    this.activeFilterChips = [];
    this.activeFilterCount = 0;
    if (this.searchComponent) {
      this.searchComponent.resetFilters();
    }
  }

  removeFilterChip(chip: string): void {
    this.activeFilterChips = this.activeFilterChips.filter(c => c !== chip);
    this.activeFilterCount = this.activeFilterChips.length;
  }
}
