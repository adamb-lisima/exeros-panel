import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate(
          '300ms ease-out',
          style({ transform: 'translateX(0)', opacity: 1 })
        )
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ transform: 'translateX(100%)', opacity: 0 })
        )
      ])
    ])
  ]
})
export class ToastComponent implements OnInit, OnDestroy {
  @Input() variant: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() message = '';
  @Input() duration = 5000;
  @Input() showCloseButton = true;
  @Output() dismissed = new EventEmitter<void>();

  progress = 100;

  private dismissTimer: ReturnType<typeof setTimeout> | null = null;
  private progressInterval: ReturnType<typeof setInterval> | null = null;
  private readonly PROGRESS_TICK = 50;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.startAutoDismiss();
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  get ariaRole(): string {
    return this.variant === 'error' ? 'alert' : 'status';
  }

  get iconPath(): string {
    switch (this.variant) {
      case 'success':
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'error':
        return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'warning':
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
      case 'info':
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  dismiss(): void {
    this.clearTimers();
    this.dismissed.emit();
  }

  private startAutoDismiss(): void {
    if (this.duration <= 0) return;

    const startTime = Date.now();

    this.progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      this.progress = Math.max(0, 100 - (elapsed / this.duration) * 100);
      this.cdr.markForCheck();
    }, this.PROGRESS_TICK);

    this.dismissTimer = setTimeout(() => {
      this.clearTimers();
      this.dismissed.emit();
    }, this.duration);
  }

  private clearTimers(): void {
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }
}
