import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ParentCommunicationService {
  private readonly targetOrigin: string;

  constructor(@Inject(PLATFORM_ID) private readonly platformId: Object) {
    this.targetOrigin = '*';
  }

  get isIframe(): boolean {
    return window !== window.parent;
  }

  sendMessage(type: string, payload: any): void {
    if (!this.isIframe) {
      return;
    }

    window.parent.postMessage(
      {
        type,
        payload
      },
      this.targetOrigin
    );
  }
}
