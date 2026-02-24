import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FleetsColorMapService {
  private readonly colorPalette = ['#FF6D00', '#00B8D4', '#FFD693', '#28A745', '#FF85A1', '#B083FF', '#FF0000', '#00FF00', '#0000FF', '#FFC300', '#8E44AD', '#3498DB', '#1ABC9C', '#E74C3C', '#9B59B6', '#F39C12', '#D35400', '#2ECC71', '#E67E22', '#16A085', '#C0392B', '#2980B9', '#7D3C98', '#45B39D', '#CD5C5C', '#6495ED', '#FF6347', '#40E0D0', '#FF69B4', '#800080', '#7FFF00', '#FFD700', '#ADFF2F', '#20B2AA', '#FF4500', '#BA55D3', '#DA70D6', '#8B0000', '#BDB76B', '#483D8B', '#008080', '#B8860B', '#556B2F', '#FF1493', '#4B0082', '#2F4F4F', '#4682B4', '#32CD32', '#FFDAB9', '#DC143C', '#8A2BE2', '#A52A2A', '#87CEFA'];
  private readonly eventTypeColorMap: { [key: string]: string } = {};
  private colorIndex = 0;

  getColor(eventType: string): string {
    if (!this.eventTypeColorMap[eventType]) {
      this.eventTypeColorMap[eventType] = this.colorPalette[this.colorIndex % this.colorPalette.length];
      this.colorIndex++;
    }
    return this.eventTypeColorMap[eventType];
  }
}
