import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { VehiclesSelectors } from '../../vehicles.selectors';

type Tab = 'vehicle' | 'mdvr' | 'details';

@Component({
  selector: 'app-vehicles-core-details',
  templateUrl: './vehicles-core-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesCoreDetailsComponent {
  selectedTab: Tab = 'details';
  vehicle$ = this.store.select(VehiclesSelectors.vehicle);

  objectKeys = Object.keys;

  constructor(private readonly store: Store) {}

  handleTabClick(tab: Tab) {
    this.selectedTab = tab;
  }

  mapVehicleType(type: string): string {
    const vehicleTypes: { [key: string]: string } = {
      HGV: 'HGV',
      COMPANY_CAR: 'Company Car',
      VAN: 'VAN',
      BUS: 'Bus'
    };

    return vehicleTypes[type] || type;
  }

  getShortAddress(location: string | null | undefined): string {
    if (!location) return '-';
    const parts = location.split(',').map(p => p.trim());
    return [parts[0], parts[1], parts[2], parts[4], parts[7]].filter(Boolean).join(', ');
  }

  fuelPercentage(value: number | null | undefined): string | number {
    if (value === null || value === undefined) {
      return '-';
    }
    return Math.min(value, 100) + '%';
  }

  formatParamName(key: string): string {
    const withSpaces = key.split('_').join(' ');
    return withSpaces
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  formatMileage(millage: number | null | undefined): string {
    if (millage === null || millage === undefined) {
      return '-';
    }
    return new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(parseFloat(millage.toFixed(2)));
  }
}
