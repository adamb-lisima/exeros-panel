import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CompanyElement, FleetAccess } from '../../../settings.model';

@Component({
  selector: 'app-settings-core-companies-company',
  templateUrl: './settings-core-companies-company.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreCompaniesCompanyComponent {
  canDelete = false;
  _company?: CompanyElement;

  @Output() createNewFleetAccess = new EventEmitter<void>();
  @Output() editFleetAccess = new EventEmitter<FleetAccess>();
  @Output() deleteFleetAccess = new EventEmitter<FleetAccess>();
  @Output() editCompany = new EventEmitter<CompanyElement>();
  @Output() deleteCompany = new EventEmitter<CompanyElement>();

  @Input() data?: FleetAccess[] | null;

  @Input() set company(company: CompanyElement | undefined) {
    this._company = company;
    const { roles_count, users_count, branches_count, vehicles_count } = { ...company };
    this.canDelete = roles_count === 0 && users_count === 0 && branches_count === 0 && vehicles_count === 0;
  }

  get company(): CompanyElement | undefined {
    return this._company;
  }

  handleCreateFleetAccessClick() {
    this.createNewFleetAccess.emit();
  }

  handleDeleteFleetAccessClick(fleetAccess: FleetAccess): void {
    this.deleteFleetAccess.emit(fleetAccess);
  }

  handleEditFleetAccessClick(fleetAccess: FleetAccess) {
    this.editFleetAccess.emit(fleetAccess);
  }

  handleEditCompanyClick() {
    this.editCompany.emit(this.company);
  }

  handleDeleteCompanyClick() {
    this.deleteCompany.emit(this.company);
  }
}
