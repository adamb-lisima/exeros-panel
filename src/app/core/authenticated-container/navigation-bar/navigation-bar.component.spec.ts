import { ChangeDetectorRef, Component, Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { NavigationBarComponent } from './navigation-bar.component';
import { ConfigSelectors } from '../../../store/config/config.selectors';
import { AuthSelectors } from '../../../store/auth/auth.selectors';
import { AccessGroup } from '../../../screen/settings/settings.model';

@Directive({ selector: '[appHasPermission]' })
class MockHasPermissionDirective {
  @Input() appHasPermission: any;
  constructor(private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef) {}
  ngOnInit(): void {
    this.viewContainer.createEmbeddedView(this.templateRef);
  }
}

@Component({ selector: 'app-navigation-bar-link', template: '<ng-content></ng-content>' })
class MockNavigationBarLinkComponent {
  @Input() isCollapsed = false;
  @Input() link = '';
  @Input() subLinkActive?: string;
  @Input() text = '';
  @Input() tooltipLabel = '';
  @Input() badge?: string | number | null;
  @Input() isActive = false;
}

@Component({ selector: 'app-navigation-bar-user', template: '' })
class MockNavigationBarUserComponent {
  @Input() isCollapsed = false;
}

describe('NavigationBarComponent', () => {
  let component: NavigationBarComponent;
  let fixture: ComponentFixture<NavigationBarComponent>;

  const mockConfigData = {
    logo: null,
    online_devices_count: 5
  };

  const mockUser = {
    role: 'SUPER_ADMIN',
    access_groups: Object.values(AccessGroup)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        NavigationBarComponent,
        MockHasPermissionDirective,
        MockNavigationBarLinkComponent,
        MockNavigationBarUserComponent
      ],
      providers: [
        provideMockStore({
          selectors: [
            { selector: ConfigSelectors.data, value: mockConfigData },
            { selector: AuthSelectors.loggedInUser, value: mockUser }
          ]
        }),
        { provide: Dialog, useValue: { open: jasmine.createSpy('open') } },
        { provide: Router, useValue: { url: '/dashboard', events: of(), navigate: jasmine.createSpy('navigate') } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('aria-label on nav element', () => {
    it('should have aria-label "Main navigation" on the nav element', () => {
      const nav = fixture.debugElement.query(By.css('nav'));
      expect(nav.nativeElement.getAttribute('aria-label')).toBe('Main navigation');
    });
  });

  describe('collapsed/expanded state toggling', () => {
    it('should default to expanded (isMenuCollapsed = false)', () => {
      expect(component.isMenuCollapsed).toBeFalse();
    });

    it('should toggle isMenuCollapsed to true when toggleMenu is called', () => {
      component.toggleMenu();
      expect(component.isMenuCollapsed).toBeTrue();
    });

    it('should toggle back to false on second call', () => {
      component.toggleMenu();
      component.toggleMenu();
      expect(component.isMenuCollapsed).toBeFalse();
    });

    it('should apply nav-sidebar--expanded class when expanded', () => {
      component.isMenuCollapsed = false;
      fixture.detectChanges();
      const nav = fixture.debugElement.query(By.css('nav'));
      expect(nav.nativeElement.classList).toContain('nav-sidebar--expanded');
      expect(nav.nativeElement.classList).not.toContain('nav-sidebar--collapsed');
    });

    it('should apply nav-sidebar--collapsed class when collapsed', () => {
      component.isMenuCollapsed = true;
      fixture.debugElement.injector.get(ChangeDetectorRef).markForCheck();
      fixture.detectChanges();
      const nav = fixture.debugElement.query(By.css('nav'));
      expect(nav.nativeElement.classList).toContain('nav-sidebar--collapsed');
      expect(nav.nativeElement.classList).not.toContain('nav-sidebar--expanded');
    });
  });

  describe('section grouping', () => {
    it('should display section headers when expanded', () => {
      component.isMenuCollapsed = false;
      fixture.detectChanges();
      const headers = fixture.debugElement.queryAll(By.css('.nav-section__header'));
      const headerTexts = headers.map(h => h.nativeElement.textContent.trim());
      expect(headerTexts).toContain('Overview');
      expect(headerTexts).toContain('Fleet Operations');
      expect(headerTexts).toContain('Safety & Events');
      expect(headerTexts).toContain('Analytics & Reports');
      expect(headerTexts).toContain('Monitoring');
    });

    it('should hide section headers when collapsed', () => {
      component.isMenuCollapsed = true;
      fixture.debugElement.injector.get(ChangeDetectorRef).markForCheck();
      fixture.detectChanges();
      const headers = fixture.debugElement.queryAll(By.css('.nav-section__header'));
      expect(headers.length).toBe(0);
    });

    it('should render navigation links for each section', () => {
      const links = fixture.debugElement.queryAll(By.directive(MockNavigationBarLinkComponent));
      const linkTexts = links.map(l => l.componentInstance.text);
      expect(linkTexts).toContain('Dashboard');
      expect(linkTexts).toContain('Fleets');
      expect(linkTexts).toContain('Live Stream');
      expect(linkTexts).toContain('Events');
      expect(linkTexts).toContain('Analytics');
      expect(linkTexts).toContain('Reports');
      expect(linkTexts).toContain('Leaderboard');
      expect(linkTexts).toContain('Map View');
      expect(linkTexts).toContain('Settings');
    });
  });
});
