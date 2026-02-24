import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StarRatingComponent implements OnInit {
  @Input() score: number = 0;
  @Input() maxScore: number = 5;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  componentId: string = '';

  ngOnInit(): void {
    this.componentId = 'star-rating-' + Math.random().toString(36).substr(2, 9);
  }

  get stars(): number[] {
    return Array(this.maxScore)
      .fill(0)
      .map((_, i) => i + 1);
  }

  getStarFillPercentage(starIndex: number, score: number): number {
    const starPosition = starIndex - 1;

    if (score >= starPosition + 1) {
      return 100;
    } else if (score > starPosition) {
      return (score - starPosition) * 100;
    }

    return 0;
  }

  getStarSize(): { width: string; height: string; svgWidth: string; svgHeight: string } {
    switch (this.size) {
      case 'sm':
        return { width: 'w-3', height: 'h-3', svgWidth: '10', svgHeight: '11' };
      case 'lg':
        return { width: 'w-5', height: 'h-5', svgWidth: '18', svgHeight: '19' };
      case 'md':
      default:
        return { width: 'w-4', height: 'h-4', svgWidth: '14', svgHeight: '15' };
    }
  }
}
