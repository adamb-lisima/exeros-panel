import { Overlay, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ChangeDetectorRef, Directive, ElementRef, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { TooltipComponent } from 'src/app/shared/directive/tooltip/tooltip.component';

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective implements OnInit, OnDestroy {
  @Input('appTooltip') text: string | undefined = '';

  private overlayRef?: OverlayRef;
  private showTimeout?: number;

  constructor(private readonly overlay: Overlay, private readonly overlayPositionBuilder: OverlayPositionBuilder, private readonly elementRef: ElementRef, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const positionStrategy = this.overlayPositionBuilder
      .flexibleConnectedTo(this.elementRef)
      .withPositions([
        { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },
        { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8 },
        { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 8 },
        { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -8 }
      ])
      .withViewportMargin(8)
      .withGrowAfterOpen(true)
      .withFlexibleDimensions(false)
      .withPush(true);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      disposeOnNavigation: true
    });
  }

  ngOnDestroy(): void {
    this.clearTimeout();
    this.hideTooltip();
    this.overlayRef?.dispose();
    document.removeEventListener('scroll', this.hideTooltip);
    document.removeEventListener('click', this.onDocumentClick);
  }

  @HostListener('mouseenter')
  onMouseenter(): void {
    this.clearTimeout();
    this.showTimeout = window.setTimeout(() => this.showTooltip(), 100);
  }

  @HostListener('mouseleave')
  onMouseleave(): void {
    this.clearTimeout();
    this.hideTooltip();
  }

  @HostListener('click')
  onClick(): void {
    this.hideTooltip();
  }

  private showTooltip(): void {
    if (!this.text || this.overlayRef?.hasAttached()) return;

    const tooltipRef = this.overlayRef?.attach(new ComponentPortal(TooltipComponent));
    if (tooltipRef) {
      tooltipRef.instance.text = this.text;
      this.cdr.detectChanges();
    }

    document.addEventListener('scroll', this.hideTooltip, { passive: true });
    document.addEventListener('click', this.onDocumentClick);
  }

  private readonly hideTooltip = (): void => {
    if (this.overlayRef?.hasAttached()) {
      this.overlayRef.detach();
      document.removeEventListener('scroll', this.hideTooltip);
      document.removeEventListener('click', this.onDocumentClick);
    }
  };

  private readonly onDocumentClick = (event: Event): void => {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.hideTooltip();
    }
  };

  private clearTimeout(): void {
    if (this.showTimeout) {
      window.clearTimeout(this.showTimeout);
      this.showTimeout = undefined;
    }
  }
}
