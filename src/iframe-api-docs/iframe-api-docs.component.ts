import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

interface IframeMessage {
  type: string;
  payload: any;
}

@Component({
  selector: 'iframe-api-docs-root',
  templateUrl: './iframe-api-docs.component.html'
})
export class IframeApiDocsComponent implements OnInit, OnDestroy {
  form = new UntypedFormGroup({
    module: new UntypedFormControl('livestream'),
    api_url: new UntypedFormControl('https://lba-api.vidematics.cloud'),
    iframe_url: new UntypedFormControl('https://lba.vidematics.cloud'),
    type: new UntypedFormControl('livestream'),
    vehicle_id: new UntypedFormControl('1444'),
    vehicle_registration_plate: new UntypedFormControl(''),
    stream_mode: new UntypedFormControl('0'),
    channels: new UntypedFormControl('1'),
    audio: new UntypedFormControl('true'),
    full_app_mode: new UntypedFormControl('false'),
    with_timeline: new UntypedFormControl('false'),
    from: new UntypedFormControl('2024-11-27 23:00:00'),
    to: new UntypedFormControl('2024-11-27 23:59:59'),
    event_id: new UntypedFormControl('202411-67446d27ed2000001b0073d4'),
    login: new UntypedFormControl(''),
    password: new UntypedFormControl(''),
    token: new UntypedFormControl(''),
    azure_access_token: new UntypedFormControl('')
  });

  isLivestream = true;
  isPlayback = false;
  isEvents = false;
  isIframeInit = false;

  receivedMessages: IframeMessage[] = [];
  lastMessage: IframeMessage | null = null;
  iframeDimensions = { width: 0, height: 0, ratio: 0 };

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    window.addEventListener('message', this.handleIframeMessage);
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.handleIframeMessage);
  }

  handleIframeMessage = (event: MessageEvent): void => {
    const iframe = document.getElementById('exeros-panel-iframe') as HTMLIFrameElement;
    if (iframe && event.source === iframe.contentWindow) {
      try {
        const message = event.data as IframeMessage;
        this.lastMessage = message;
        this.receivedMessages.unshift(message);

        if (this.receivedMessages.length > 10) {
          this.receivedMessages.pop();
        }

        if (message.type === 'DIMENSIONS' && message.payload) {
          this.iframeDimensions = message.payload;
          this.adjustIframeSize();
        }
      } catch (error) {
        console.error('Error processing iframe message:', error);
      }
    }
  };

  adjustIframeSize(): void {
    if (!this.iframeDimensions.width || !this.iframeDimensions.height) {
      return;
    }

    const iframe = document.getElementById('exeros-panel-iframe') as HTMLIFrameElement;
    const container = iframe.parentElement;

    if (container) {
      const containerWidth = container.clientWidth;
      const newHeight = containerWidth * this.iframeDimensions.ratio;

      iframe.style.height = `${newHeight}px`;
    }
  }

  onTypeChange(event: Event): void {
    const type = (event.target as HTMLSelectElement).value;
    this.isLivestream = type === 'livestream';
    this.isPlayback = type === 'playback';
    this.isEvents = type === 'events';

    this.form.patchValue({
      module: type
    });
  }

  handlePushDataClick(): void {
    const { login, password, token, api_url, azure_access_token, ...data } = this.form.value;
    let selToken = token;
    data['url'] = api_url;

    if (!token && login && password) {
      this.getAccessToken(login, password, api_url, azure_access_token)
        .then(fetchedToken => {
          selToken = fetchedToken;
          data['token'] = selToken;
          this.pushDataToIframe(data);
        })
        .catch(error => console.error('Error fetching access token:', error));
    } else if (token) {
      data['token'] = selToken;
      this.pushDataToIframe(data);
    } else {
      console.error('Either login/password or access token must be provided.');
    }
  }

  async getAccessToken(login: string, password: string, url: string, azure_access_token: string): Promise<string> {
    try {
      const response = await this.http.post<{ data: any }>(url + '/api/auth/login', { email: login, password: password, application: 'iframe-api-access', azure_access_token }).toPromise();
      if (response && response.data && response.data.access_token) {
        this.form.patchValue({
          token: response.data.access_token
        });
        return response.data.access_token;
      } else {
        throw new Error('Token not found in response');
      }
    } catch (error) {
      console.error('Error fetching access token:', error);
      throw error;
    }
  }

  pushDataToIframe(data: any): void {
    const frame = document.getElementById('exeros-panel-iframe') as HTMLIFrameElement;

    if (!this.isIframeInit) {
      frame.src = data.iframe_url;
      frame.width = data.width;
      frame.height = data.height;

      this.isIframeInit = true;
    }

    let message: any = {};

    if (this.isLivestream) {
      message = {
        vehicle_id: data.vehicle_id,
        vehicle_registration_plate: data.vehicle_registration_plate,
        stream_mode: data.stream_mode,
        channels: data.channels ?? null,
        audio: data.audio
      };
    } else if (this.isPlayback) {
      message = {
        with_timeline: data.with_timeline,
        vehicle_id: data.vehicle_id,
        vehicle_registration_plate: data.vehicle_registration_plate,
        channels: data.channels ?? null,
        from: data.from,
        to: data.to
      };
    } else if (this.isEvents) {
      message = {
        event_id: data.event_id,
        channels: data.channels ?? null
      };
    }
    message.token = data.token;
    message.module = data.module;

    setTimeout(() => {
      frame.contentWindow?.postMessage(message, frame.src);
    }, 1000);
  }

  clearMessages(): void {
    this.receivedMessages = [];
    this.lastMessage = null;
  }
}
