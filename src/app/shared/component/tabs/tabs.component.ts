import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import {
  animate,
  style,
  transition,
  trigger
} from '@angular/animations';

export interface TabItem {
  label: string;
  count?: number;
  disabled?: boolean;
}

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('crossfade', [
      transition('* <=> *', [
        style({ opacity: 0 }),
        animate('200ms ease-in-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class TabsComponent {
  @Input() variant: 'underline' | 'pill' = 'underline';
  @Input() tabs: TabItem[] = [];
  @Output() tabChange = new EventEmitter<number>();

  activeIndex = 0;

  selectTab(index: number): void {
    if (this.tabs[index]?.disabled) return;
    this.activeIndex = index;
    this.tabChange.emit(index);
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    let newIndex: number | null = null;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      newIndex = this.findNextEnabledTab(index, 1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      newIndex = this.findNextEnabledTab(index, -1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectTab(index);
      return;
    }

    if (newIndex !== null) {
      const tabElements = (
        event.currentTarget as HTMLElement
      ).parentElement?.querySelectorAll('[role="tab"]');
      (tabElements?.[newIndex] as HTMLElement)?.focus();
    }
  }

  private findNextEnabledTab(
    currentIndex: number,
    direction: 1 | -1
  ): number | null {
    const len = this.tabs.length;
    let next = currentIndex + direction;

    for (let i = 0; i < len; i++) {
      if (next < 0) next = len - 1;
      if (next >= len) next = 0;
      if (!this.tabs[next]?.disabled) return next;
      next += direction;
    }

    return null;
  }
}
