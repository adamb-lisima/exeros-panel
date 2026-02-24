import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-dialog-wrapper',
  templateUrl: './dialog-wrapper.component.html',
  styleUrls: ['./dialog-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('scaleIn', [
      transition(':enter', [
        style({ transform: 'scale(0.95)', opacity: 0 }),
        animate(
          '200ms ease-out',
          style({ transform: 'scale(1)', opacity: 1 })
        )
      ]),
      transition(':leave', [
        animate(
          '150ms ease-in',
          style({ transform: 'scale(0.95)', opacity: 0 })
        )
      ])
    ])
  ]
})
export class DialogWrapperComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() variant: 'informational' | 'destructive' = 'informational';
  @Output() closed = new EventEmitter<void>();

  @ViewChild('dialogPanel') dialogPanel!: ElementRef<HTMLElement>;

  private triggerElement: Element | null = null;

  ngOnInit(): void {
    this.triggerElement = document.activeElement;
  }

  ngAfterViewInit(): void {
    this.focusFirstElement();
  }

  ngOnDestroy(): void {
    if (this.triggerElement instanceof HTMLElement) {
      this.triggerElement.focus();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  close(): void {
    this.closed.emit();
  }

  private focusFirstElement(): void {
    const panel = this.dialogPanel?.nativeElement;
    if (!panel) return;

    const focusable = panel.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) {
      focusable.focus();
    } else {
      panel.focus();
    }
  }
}
