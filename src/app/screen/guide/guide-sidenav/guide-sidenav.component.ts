import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import RouteConst from 'src/app/const/route';
import { GuideMenuItem } from '../guide.model';
import { selectActiveSlug, selectMenuItems } from '../guide.selectors';

@Component({
  selector: 'app-guide-sidenav',
  templateUrl: './guide-sidenav.component.html'
})
export class GuideSidenavComponent implements OnInit {
  menuItems$!: Observable<GuideMenuItem[]>;
  activeSlug$!: Observable<string | null>;
  RouteConst = RouteConst;

  constructor(private readonly store: Store, private readonly router: Router) {}

  ngOnInit(): void {
    this.menuItems$ = this.store.select(selectMenuItems);
    this.activeSlug$ = this.store.select(selectActiveSlug);
  }

  navigateTo(slug: string): void {
    this.router.navigate(['/guide', slug]);
  }
}
