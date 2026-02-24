import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-tag',
  template: `<span class="tag" [style.--tag-color]="color"><ng-content></ng-content></span>`,
  styleUrls: ['./tag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagComponent {
  @Input() color = 'var(--brand-500)';
}
