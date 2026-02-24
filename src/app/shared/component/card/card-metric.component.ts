import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-metric',
  templateUrl: './card-metric.component.html',
  styleUrls: ['./card-metric.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardMetricComponent {
  @Input() value: string | number = '';
  @Input() label = '';
  @Input() trend?: { direction: 'up' | 'down'; percentage: number };
  @Input() sparklineData?: number[];

  get trendIcon(): string {
    return this.trend?.direction === 'up' ? '▲' : '▼';
  }

  get trendClass(): string {
    return this.trend?.direction === 'up' ? 'trend--up' : 'trend--down';
  }

  get sparklinePath(): string {
    if (!this.sparklineData || this.sparklineData.length < 2) return '';
    const max = Math.max(...this.sparklineData);
    const min = Math.min(...this.sparklineData);
    const range = max - min || 1;
    const width = 100;
    const height = 32;
    const step = width / (this.sparklineData.length - 1);

    const points = this.sparklineData.map((val, i) => {
      const x = i * step;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    });

    return `M${points.join(' L')}`;
  }
}
