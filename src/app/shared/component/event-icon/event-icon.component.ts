import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-event-icon',
  templateUrl: './event-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventIconComponent {
  @Input() set eventIcon(value: string) {
    this._eventType = value;
  }

  get eventType(): string | null | undefined {
    return this._eventType;
  }

  private _eventType: string | null = null;
}
