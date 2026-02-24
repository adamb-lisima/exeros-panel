import { Directive, Input, TemplateRef } from '@angular/core';
import { TimelineTab } from './timeline.model';

@Directive({
  selector: '[timelineTab]'
})
export class TimelineTabDirective {
  @Input() timelineTab!: TimelineTab;
  @Input() timelineTabText = '';
  @Input() timelineTabDisabled = false;

  constructor(public template: TemplateRef<any>) {}
}
