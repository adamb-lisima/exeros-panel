import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-vehicle-status-icons',
  templateUrl: './vehicle-status-icons.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleStatusIconsComponent {
  @Input() hasTelematics: boolean = false;
  @Input() hasVideo: boolean = false;
  @Input() iconSize: 'small' | 'medium' | 'large' = 'medium';

  get telematicIconSize(): number {
    return this.getSizeValue(20);
  }

  get videoIconWidth(): number {
    return this.getSizeValue(this.iconSize === 'large' ? 20 : 16);
  }

  get videoIconHeight(): number {
    return this.getSizeValue(this.iconSize === 'large' ? 20 : 13);
  }

  private getSizeValue(baseSize: number): number {
    const sizeMultiplier = {
      small: 0.8,
      medium: 1,
      large: 1.2
    };

    return baseSize * sizeMultiplier[this.iconSize];
  }
}
