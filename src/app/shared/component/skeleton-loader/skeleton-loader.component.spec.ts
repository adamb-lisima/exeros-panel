import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SkeletonLoaderComponent } from './skeleton-loader.component';

describe('SkeletonLoaderComponent', () => {
  let component: SkeletonLoaderComponent;
  let fixture: ComponentFixture<SkeletonLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SkeletonLoaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonLoaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should default to text-block variant', () => {
    fixture.detectChanges();
    expect(component.variant).toBe('text-block');
  });

  describe('card variant', () => {
    beforeEach(() => {
      component.variant = 'card';
      fixture.detectChanges();
    });

    it('should render header, body, and footer blocks', () => {
      const header = fixture.debugElement.query(By.css('.skeleton--header'));
      const body = fixture.debugElement.query(By.css('.skeleton--body'));
      const footer = fixture.debugElement.query(By.css('.skeleton--footer'));

      expect(header).toBeTruthy();
      expect(body).toBeTruthy();
      expect(footer).toBeTruthy();
    });

    it('should apply skeleton class to all placeholder shapes', () => {
      const skeletons = fixture.debugElement.queryAll(By.css('.skeleton'));
      expect(skeletons.length).toBe(3);
    });
  });

  describe('table-row variant', () => {
    beforeEach(() => {
      component.variant = 'table-row';
      fixture.detectChanges();
    });

    it('should render horizontal column blocks', () => {
      const row = fixture.debugElement.query(By.css('.skeleton-row'));
      const cols = fixture.debugElement.queryAll(By.css('.skeleton--col'));

      expect(row).toBeTruthy();
      expect(cols.length).toBe(4);
    });

    it('should apply skeleton class to all column blocks', () => {
      const skeletons = fixture.debugElement.queryAll(By.css('.skeleton'));
      expect(skeletons.length).toBe(4);
    });
  });

  describe('chart variant', () => {
    beforeEach(() => {
      component.variant = 'chart';
      fixture.detectChanges();
    });

    it('should render a tall rectangular block', () => {
      const chart = fixture.debugElement.query(By.css('.skeleton--chart'));
      expect(chart).toBeTruthy();
    });

    it('should apply skeleton class to the chart block', () => {
      const skeletons = fixture.debugElement.queryAll(By.css('.skeleton'));
      expect(skeletons.length).toBe(1);
    });
  });

  describe('text-block variant', () => {
    beforeEach(() => {
      component.variant = 'text-block';
      fixture.detectChanges();
    });

    it('should render stacked line blocks', () => {
      const lines = fixture.debugElement.queryAll(By.css('.skeleton--line'));
      expect(lines.length).toBe(3);
    });

    it('should apply skeleton class to all line blocks', () => {
      const skeletons = fixture.debugElement.queryAll(By.css('.skeleton'));
      expect(skeletons.length).toBe(3);
    });
  });
});
