import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modules-list-element',
  templateUrl: './modules-list-element.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModulesListElementComponent {
  @Output() clickCheck = new EventEmitter<boolean>();

  @Input() value = false;
  @Input() name = '';

  handleCheckClick(value: boolean) {
    this.clickCheck.emit(value);
  }
}
