import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [trigger('tooltip', [transition(':enter', [style({ opacity: 0 }), animate(300, style({ opacity: 1 }))]), transition(':leave', [animate(300, style({ opacity: 0 }))])])]
})
export class TooltipComponent {
  @Input() text = '';

  @HostBinding('class') hostClass = 'block';
}
