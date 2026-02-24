import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { EventStrategy, EventStrategyResponse, getAlarmTypeName } from '../../../settings.model';

@Component({
  selector: 'app-settings-core-event-strategies-list',
  templateUrl: './settings-core-event-strategies-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreEventStrategiesListComponent {
  @Input() data$?: Observable<EventStrategyResponse | null>;
  @Output() editStrategy = new EventEmitter<EventStrategy>();
  @Output() deleteStrategy = new EventEmitter<EventStrategy>();

  protected readonly getAlarmTypeName = getAlarmTypeName;

  handleEditClick(strategy: EventStrategy): void {
    this.editStrategy.emit(strategy);
  }

  handleDeleteClick(strategy: EventStrategy): void {
    this.deleteStrategy.emit(strategy);
  }
}
