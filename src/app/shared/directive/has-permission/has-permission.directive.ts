import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, tap } from 'rxjs';
import { AppState } from 'src/app/store/app-store.model';
import { AccessGroup } from '../../../screen/settings/settings.model';
import { AuthSelectors } from '../../../store/auth/auth.selectors';

@Directive({
  selector: '[appHasPermission]'
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  @Input() appHasPermission!: [AccessGroup[]];
  @Input() appHasPermissionElse?: TemplateRef<any>;
  private sub?: Subscription;

  constructor(private readonly viewContainerRef: ViewContainerRef, private readonly templateRef: TemplateRef<any>, private readonly store: Store<AppState>) {}

  ngOnInit(): void {
    const [accessGroups] = this.appHasPermission;
    this.sub = this.store
      .select(AuthSelectors.loggedInUser)
      .pipe(
        tap(user => {
          if (user?.role === 'SUPER_ADMIN') {
            this.viewContainerRef.clear();
            this.viewContainerRef.createEmbeddedView(this.templateRef);
            return;
          }

          for (let i = 0; i < accessGroups.length; i++) {
            if (user?.access_groups.includes(accessGroups[i])) {
              this.viewContainerRef.clear();
              this.viewContainerRef.createEmbeddedView(this.templateRef);
              return;
            }
          }

          if (this.appHasPermissionElse) {
            this.viewContainerRef.clear();
            this.viewContainerRef.createEmbeddedView(this.appHasPermissionElse);
          } else {
            this.viewContainerRef.clear();
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
