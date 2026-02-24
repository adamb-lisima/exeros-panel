import { Component } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'parent-root',
  templateUrl: './parent.component.html'
})
export class ParentComponent {
  form = new UntypedFormGroup({
    url: new UntypedFormControl(''),
    width: new UntypedFormControl('100%'),
    height: new UntypedFormControl('100%'),
    token: new UntypedFormControl('')
  });

  handlePushDataClick(): void {
    const { url, width, height, ...data } = this.form.value;
    const frame = document.getElementById('exeros-panel-iframe') as HTMLIFrameElement;
    if (frame.src !== url) {
      frame.src = url;
    }
    frame.width = width;
    frame.height = height;
    setTimeout(() => frame.contentWindow?.postMessage(data, { targetOrigin: frame.src }), 1000);
  }
}
