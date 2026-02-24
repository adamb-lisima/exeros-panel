import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CardComponent } from './card.component';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';

@Component({
  template: `
    <app-card [variant]="variant" [loading]="loading">
      <span card-header>Test Header</span>
      <span card-body>Test Body</span>
      <span card-footer>Test Footer</span>
    </app-card>
  `
})
class TestHostComponent {
  variant: 'default' | 'metric' | 'chart' | 'media' = 'default';
  loading = false;
}

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CardComponent, SkeletonLoaderComponent, TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should default to default variant', () => {
    fixture.detectChanges();
    expect(component.variant).toBe('default');
  });

  describe('skeletonVariant getter', () => {
    it('should return chart for chart variant', () => {
      component.variant = 'chart';
      expect(component.skeletonVariant).toBe('chart');
    });

    it('should return card for default variant', () => {
      component.variant = 'default';
      expect(component.skeletonVariant).toBe('card');
    });

    it('should return card for metric variant', () => {
      component.variant = 'metric';
      expect(component.skeletonVariant).toBe('card');
    });

    it('should return card for media variant', () => {
      component.variant = 'media';
      expect(component.skeletonVariant).toBe('card');
    });
  });

  describe('variant CSS classes', () => {
    it('should apply card--default class by default', () => {
      fixture.detectChanges();
      const card = fixture.debugElement.query(By.css('.card'));
      expect(card.nativeElement.classList).toContain('card--default');
    });

    it('should apply card--chart class for chart variant', () => {
      component.variant = 'chart';
      fixture.detectChanges();
      const card = fixture.debugElement.query(By.css('.card'));
      expect(card.nativeElement.classList).toContain('card--chart');
    });

    it('should apply card--metric class for metric variant', () => {
      component.variant = 'metric';
      fixture.detectChanges();
      const card = fixture.debugElement.query(By.css('.card'));
      expect(card.nativeElement.classList).toContain('card--metric');
    });

    it('should apply card--media class for media variant', () => {
      component.variant = 'media';
      fixture.detectChanges();
      const card = fixture.debugElement.query(By.css('.card'));
      expect(card.nativeElement.classList).toContain('card--media');
    });
  });

  describe('loading state', () => {
    it('should apply card--loading class when loading is true', () => {
      component.loading = true;
      fixture.detectChanges();
      const card = fixture.debugElement.query(By.css('.card'));
      expect(card.nativeElement.classList).toContain('card--loading');
    });

    it('should not apply card--loading class when loading is false', () => {
      component.loading = false;
      fixture.detectChanges();
      const card = fixture.debugElement.query(By.css('.card'));
      expect(card.nativeElement.classList).not.toContain('card--loading');
    });

    it('should show skeleton loader when loading is true', () => {
      component.loading = true;
      fixture.detectChanges();
      const skeleton = fixture.debugElement.query(By.css('app-skeleton-loader'));
      expect(skeleton).toBeTruthy();
    });

    it('should not show skeleton loader when loading is false', () => {
      component.loading = false;
      fixture.detectChanges();
      const skeleton = fixture.debugElement.query(By.css('app-skeleton-loader'));
      expect(skeleton).toBeFalsy();
    });
  });

  describe('content projection (TestHost)', () => {
    let hostFixture: ComponentFixture<TestHostComponent>;
    let hostComponent: TestHostComponent;

    beforeEach(() => {
      hostFixture = TestBed.createComponent(TestHostComponent);
      hostComponent = hostFixture.componentInstance;
    });

    it('should project header content', () => {
      hostFixture.detectChanges();
      const header = hostFixture.debugElement.query(By.css('.card__header'));
      expect(header.nativeElement.textContent).toContain('Test Header');
    });

    it('should project body content', () => {
      hostFixture.detectChanges();
      const body = hostFixture.debugElement.query(By.css('.card__body'));
      expect(body.nativeElement.textContent).toContain('Test Body');
    });

    it('should project footer content', () => {
      hostFixture.detectChanges();
      const footer = hostFixture.debugElement.query(By.css('.card__footer'));
      expect(footer.nativeElement.textContent).toContain('Test Footer');
    });

    it('should hide projected content when loading is true', () => {
      hostComponent.loading = true;
      hostFixture.detectChanges();
      const header = hostFixture.debugElement.query(By.css('.card__header'));
      const body = hostFixture.debugElement.query(By.css('.card__body'));
      const footer = hostFixture.debugElement.query(By.css('.card__footer'));
      expect(header).toBeFalsy();
      expect(body).toBeFalsy();
      expect(footer).toBeFalsy();
    });

    it('should show skeleton loader when loading is true', () => {
      hostComponent.loading = true;
      hostFixture.detectChanges();
      const skeleton = hostFixture.debugElement.query(By.css('app-skeleton-loader'));
      expect(skeleton).toBeTruthy();
    });
  });
});
