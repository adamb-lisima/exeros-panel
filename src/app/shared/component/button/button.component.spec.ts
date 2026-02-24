import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ButtonComponent } from './button.component';

@Component({
  template: `
    <app-button
      [variant]="variant"
      [size]="size"
      [loading]="loading"
      [disabled]="disabled"
      [ariaLabel]="ariaLabel"
      (buttonClick)="onClick()">
      {{ label }}
    </app-button>
  `
})
class TestHostComponent {
  variant: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'icon-only' =
    'primary';
  size: 'sm' | 'md' | 'lg' = 'md';
  loading = false;
  disabled = false;
  ariaLabel?: string;
  label = 'Click me';
  clicked = false;
  onClick(): void {
    this.clicked = true;
  }
}

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ButtonComponent, TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should default to primary variant', () => {
    fixture.detectChanges();
    expect(component.variant).toBe('primary');
  });

  it('should default to md size', () => {
    fixture.detectChanges();
    expect(component.size).toBe('md');
  });

  describe('variant CSS classes', () => {
    it('should apply btn--primary class by default', () => {
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('button'));
      expect(btn.nativeElement.classList).toContain('btn--primary');
    });

    it('should apply btn--secondary class for secondary variant', () => {
      component.variant = 'secondary';
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('button'));
      expect(btn.nativeElement.classList).toContain('btn--secondary');
    });

    it('should apply btn--ghost class for ghost variant', () => {
      component.variant = 'ghost';
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('button'));
      expect(btn.nativeElement.classList).toContain('btn--ghost');
    });

    it('should apply btn--destructive class for destructive variant', () => {
      component.variant = 'destructive';
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('button'));
      expect(btn.nativeElement.classList).toContain('btn--destructive');
    });

    it('should apply btn--icon-only class for icon-only variant', () => {
      component.variant = 'icon-only';
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('button'));
      expect(btn.nativeElement.classList).toContain('btn--icon-only');
    });
  });

  describe('size CSS classes', () => {
    it('should apply btn--sm class for sm size', () => {
      component.size = 'sm';
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('button'));
      expect(btn.nativeElement.classList).toContain('btn--sm');
    });

    it('should apply btn--md class by default', () => {
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('button'));
      expect(btn.nativeElement.classList).toContain('btn--md');
    });

    it('should apply btn--lg class for lg size', () => {
      component.size = 'lg';
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('button'));
      expect(btn.nativeElement.classList).toContain('btn--lg');
    });
  });

  describe('loading state', () => {
    it('should add btn--loading class when loading is true', () => {
      component.loading = true;
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('button'));
      expect(btn.nativeElement.classList).toContain('btn--loading');
    });

    it('should show spinner element when loading', () => {
      component.loading = true;
      fixture.detectChanges();
      const spinner = fixture.debugElement.query(By.css('.btn-spinner'));
      expect(spinner).toBeTruthy();
    });

    it('should hide content when loading', () => {
      component.loading = true;
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('button'));
      expect(btn.nativeElement.textContent.trim()).toBe('');
    });

    it('should not show spinner when not loading', () => {
      component.loading = false;
      fixture.detectChanges();
      const spinner = fixture.debugElement.query(By.css('.btn-spinner'));
      expect(spinner).toBeFalsy();
    });

    it('should not emit buttonClick when clicked while loading', () => {
      component.loading = true;
      fixture.detectChanges();
      spyOn(component.buttonClick, 'emit');
      const btn = fixture.debugElement.query(By.css('button'));
      btn.nativeElement.click();
      expect(component.buttonClick.emit).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('should set disabled attribute on button when disabled', () => {
      component.disabled = true;
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('button'));
      expect(btn.nativeElement.disabled).toBeTrue();
    });

    it('should not emit buttonClick when clicked while disabled', () => {
      component.disabled = true;
      fixture.detectChanges();
      spyOn(component.buttonClick, 'emit');
      component.handleButtonClick();
      expect(component.buttonClick.emit).not.toHaveBeenCalled();
    });
  });

  describe('icon-only variant', () => {
    it('should render aria-label attribute from ariaLabel input', () => {
      component.variant = 'icon-only';
      component.ariaLabel = 'Close dialog';
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('button'));
      expect(btn.nativeElement.getAttribute('aria-label')).toBe(
        'Close dialog'
      );
    });

    it('should not render aria-label when ariaLabel is not set', () => {
      component.variant = 'icon-only';
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('button'));
      expect(btn.nativeElement.getAttribute('aria-label')).toBeNull();
    });
  });

  describe('buttonClick output', () => {
    it('should emit when clicked and not loading or disabled', () => {
      fixture.detectChanges();
      spyOn(component.buttonClick, 'emit');
      const btn = fixture.debugElement.query(By.css('button'));
      btn.nativeElement.click();
      expect(component.buttonClick.emit).toHaveBeenCalled();
    });
  });

  describe('content projection (TestHost)', () => {
    let hostFixture: ComponentFixture<TestHostComponent>;
    let hostComponent: TestHostComponent;

    beforeEach(() => {
      hostFixture = TestBed.createComponent(TestHostComponent);
      hostComponent = hostFixture.componentInstance;
    });

    it('should project text content', () => {
      hostFixture.detectChanges();
      const btn = hostFixture.debugElement.query(By.css('button'));
      expect(btn.nativeElement.textContent.trim()).toContain('Click me');
    });

    it('should emit buttonClick to host when clicked', () => {
      hostFixture.detectChanges();
      const btn = hostFixture.debugElement.query(By.css('button'));
      btn.nativeElement.click();
      expect(hostComponent.clicked).toBeTrue();
    });

    it('should not emit to host when loading', () => {
      hostComponent.loading = true;
      hostFixture.detectChanges();
      const btn = hostFixture.debugElement.query(By.css('button'));
      btn.nativeElement.click();
      expect(hostComponent.clicked).toBeFalse();
    });

    it('should apply variant class from host input', () => {
      hostComponent.variant = 'destructive';
      hostFixture.detectChanges();
      const btn = hostFixture.debugElement.query(By.css('button'));
      expect(btn.nativeElement.classList).toContain('btn--destructive');
    });

    it('should apply aria-label from host input', () => {
      hostComponent.variant = 'icon-only';
      hostComponent.ariaLabel = 'Delete item';
      hostFixture.detectChanges();
      const btn = hostFixture.debugElement.query(By.css('button'));
      expect(btn.nativeElement.getAttribute('aria-label')).toBe('Delete item');
    });
  });
});
