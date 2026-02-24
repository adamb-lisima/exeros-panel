import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, Inject, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Event, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, debounceTime, filter, map, Subject, take, throttleTime } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IframeService } from 'src/app/service/iframe/iframe.service';
import { AppState } from 'src/app/store/app-store.model';
import { IframeInput } from 'src/app/store/iframe/iframe.model';
import { InactivityService } from './inactivity.service';
import { ParentCommunicationService } from './service/parent-communication/parent-communication.service';
import { AuthSelectors } from './store/auth/auth.selectors';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
  vm$ = combineLatest({
    loadingNumber: this.store.select(state => state.application.loadingNumber),
    accessToken: this.store.select(AuthSelectors.accessToken),
    iframeInit: this.store.select(state => state.iframe.init)
  });

  isGuidePage = false;
  private readonly _inactivityService: InactivityService;
  private popStateListener: any;
  private keydownListener: any;
  private readonly backButtonSubject = new Subject<void>();
  private resizeListener: (() => void) | null = null;
  private readonly destroy$ = new Subject<void>();
  private readonly resizeSubject = new Subject<void>();

  constructor(public iframeService: IframeService, public inactivityService: InactivityService, private readonly store: Store<AppState>, private readonly parentComm: ParentCommunicationService, private readonly ngZone: NgZone, @Inject(DOCUMENT) private readonly document: Document, private readonly router: Router) {
    this._inactivityService = inactivityService;

    if (this.iframeService.isIframe) {
      this.blockBackButton();
    }
  }

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(event => event as NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: event => {
          this.isGuidePage = event.url.includes('/guide');
        }
      });

    if (this.iframeService.isIframe) {
      this.store
        .select(state => state.iframe.init)
        .pipe(
          filter(init => init === true),
          take(1),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: () => {
            setTimeout(() => this.sendDimensions(), 300);
            this.resizeListener = () => this.resizeSubject.next();
            window.addEventListener('resize', this.resizeListener);
          }
        });

      this.resizeSubject.pipe(throttleTime(300), takeUntil(this.destroy$)).subscribe(() => this.sendDimensions());
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }

    if (this.popStateListener) {
      window.removeEventListener('popstate', this.popStateListener);
    }

    if (this.keydownListener) {
      window.removeEventListener('keydown', this.keydownListener);
    }
  }

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent<IframeInput | undefined>) {
    if (this.iframeService.isIframe && event.data?.token) {
      this.iframeService.process(event.data);
    }
  }

  private blockBackButton(): void {
    this.backButtonSubject.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.parentComm.sendMessage('BACK_BUTTON_PRESSED', {});
      }
    });

    this.ngZone.runOutsideAngular(() => {
      window.history.pushState(null, '', window.location.href);
      window.history.pushState(null, '', window.location.href);

      this.popStateListener = () => {
        window.history.pushState(null, '', window.location.href);
        this.ngZone.run(() => this.backButtonSubject.next());
      };
      window.addEventListener('popstate', this.popStateListener);

      this.keydownListener = (event: KeyboardEvent) => {
        if ((event.altKey && event.key === 'ArrowLeft') || (event.key === 'Backspace' && !(this.document.activeElement instanceof HTMLInputElement) && !(this.document.activeElement instanceof HTMLTextAreaElement))) {
          event.preventDefault();
          this.ngZone.run(() => this.backButtonSubject.next());
        }
      };
      window.addEventListener('keydown', this.keydownListener);
    });

    this.router.events
      .pipe(
        filter((event: Event): event is NavigationStart => event instanceof NavigationStart),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: event => {
          if (event.navigationTrigger === 'popstate') {
            this.router.navigate([this.router.url], { skipLocationChange: true });
            this.backButtonSubject.next();
          }
        }
      });

    const script = this.document.createElement('script');
    script.textContent = `      (function() {
        history.pushState(null, '', location.href);
        history.pushState(null, '', location.href);
        window.addEventListener('popstate', function(event) {
          history.pushState(null, '', location.href);
          if (window !== window.parent) {
            try {
              window.parent.postMessage({
                type: 'BACK_BUTTON_PRESSED',
                payload: {}
              }, '*');
            } catch(e) {}
          }
        });
      })();
    `;
    this.document.head.appendChild(script);
  }

  private sendDimensions(): void {
    if (!this.iframeService.isIframe) {
      return;
    }

    const width = document.body.scrollWidth;
    const height = document.body.scrollHeight;
    const ratio = height / width;

    this.parentComm.sendMessage('DIMENSIONS', { width, height, ratio });
  }
}
