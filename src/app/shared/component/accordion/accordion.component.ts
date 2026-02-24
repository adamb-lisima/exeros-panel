import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-accordion',
  templateUrl: './accordion.component.html'
})
export class AccordionComponent {
  @Input() expanded = false;
  @Input() expandedClass = '';
  @Input() headerClass = '';
  @Input() contentClass = '';

  handleToggle(): void {
    this.expanded = !this.expanded;
  }
}
