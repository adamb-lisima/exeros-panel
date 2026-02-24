import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CompanyElement } from '../../../settings.model';

@Component({
  selector: 'app-settings-core-companies-list',
  templateUrl: './settings-core-companies-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreCompaniesListComponent {
  @Output() deleteCompany = new EventEmitter<CompanyElement>();
  @Output() editCompany = new EventEmitter<CompanyElement>();
  @Output() createNewCompany = new EventEmitter<void>();

  @Input() data?: CompanyElement[] | null = [];

  handleDeleteCompanyClick(company: CompanyElement): void {
    this.deleteCompany.emit(company);
  }

  handleEditCompanyClick(company: CompanyElement) {
    this.editCompany.emit(company);
  }
}
