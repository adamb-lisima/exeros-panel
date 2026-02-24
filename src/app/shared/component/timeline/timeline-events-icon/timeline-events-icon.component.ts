import { CloseScrollStrategy, ScrollDispatcher, ViewportRuler } from '@angular/cdk/overlay';
import { Component, EventEmitter, Input, NgZone, Output } from '@angular/core';

@Component({
  selector: 'app-timeline-events-icon',
  templateUrl: './timeline-events-icon.component.html'
})
export class TimelineEventsIconComponent {
  scrollStrategy = new CloseScrollStrategy(this.scrollDispatcher, this.ngZone, this.viewportRuler);
  showOverlay = false;
  _eventName?: string;
  eventType: string | null = null;
  @Input() icon?: string;

  get eventName(): string | undefined {
    return this._eventName;
  }
  @Input() set eventName(value: string | undefined) {
    this._eventName = value;
  }
  @Input() set eventIcon(value: string) {
    this.eventType = value;
  }
  @Output() mouseOverIcon = new EventEmitter<void>();

  constructor(private readonly scrollDispatcher: ScrollDispatcher, private readonly ngZone: NgZone, private readonly viewportRuler: ViewportRuler) {}

  onMouseOverHandle(): void {
    this.showOverlay = true;
    this.mouseOverIcon.emit();
  }
}
