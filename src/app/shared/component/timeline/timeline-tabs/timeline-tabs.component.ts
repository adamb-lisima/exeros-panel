import { ChangeDetectionStrategy, Component, ContentChildren, EventEmitter, Input, Output, QueryList } from '@angular/core';
import { TimelineTab } from 'src/app/shared/component/timeline/timeline.model';
import { TimelineTabDirective } from '../timeline-tab.directive';

@Component({
  selector: 'app-timeline-tabs',
  templateUrl: './timeline-tabs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineTabsComponent {
  @ContentChildren(TimelineTabDirective) timelineTabs?: QueryList<TimelineTabDirective>;
  @Input() selectedTab?: TimelineTab | null;
  @Output() selectedTabChange = new EventEmitter<TimelineTab>();
  @Input() disabledTabs: Record<string, boolean> = {};

  handleTabClick(tab: TimelineTab) {
    this.selectedTabChange.next(tab);
  }

  isTabDisabled(tab: TimelineTab): boolean {
    return this.disabledTabs[tab];
  }
}
