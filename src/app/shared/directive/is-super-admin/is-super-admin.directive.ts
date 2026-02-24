import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, tap } from 'rxjs';
import { AppState } from 'src/app/store/app-store.model';
import { AuthSelectors } from '../../../store/auth/auth.selectors';

@Directive({
  selector: '[appIsSuperAdmin]'
})
export class IsSuperAdminDirective implements OnInit, OnDestroy {
  @Input() appIsSuperAdmin: boolean = false; // TRUE if we also allow ADMIN
  @Input() appIsSuperAdminElse?: TemplateRef<any>;
  private sub?: Subscription;

  constructor(private readonly viewContainerRef: ViewContainerRef, private readonly templateRef: TemplateRef<any>, private readonly store: Store<AppState>) {}

  ngOnInit(): void {
    this.sub = this.store
      .select(AuthSelectors.loggedInUser)
      .pipe(
        tap(user => {
          this.viewContainerRef.clear();

          const isSuperAdmin = user?.role === 'SUPER_ADMIN';
          const isAdmin = user?.role === 'ADMIN';
          const hasAccess = isSuperAdmin || (isAdmin && this.appIsSuperAdmin);

          if (hasAccess) {
            this.viewContainerRef.createEmbeddedView(this.templateRef);
          }
          return;
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
