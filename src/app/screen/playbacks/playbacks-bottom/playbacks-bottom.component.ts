import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-playbacks-bottom',
  templateUrl: './playbacks-bottom.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaybacksBottomComponent {
  @Output() hideClick = new EventEmitter<void>();
  @Input() isHidden = false;
}
