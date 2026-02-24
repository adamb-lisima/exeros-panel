import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import RouteConst from 'src/app/const/route';
import { IframeService } from '../../service/iframe/iframe.service';
import { AuthActions } from '../../store/auth/auth.actions';
import { AuthSelectors } from '../../store/auth/auth.selectors';

@Component({
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  readonly ROUTE_CONST = RouteConst;

  accessToken$ = this.store.select(AuthSelectors.accessToken);
  form = new UntypedFormGroup({
    email: new UntypedFormControl(''),
    password: new UntypedFormControl(''),
    remember_me: new UntypedFormControl(false),
    code: new UntypedFormControl(null)
  });

  showLogin: boolean = true;
  showCode: boolean = false;

  step = 1;

  constructor(public iframeService: IframeService, private readonly store: Store, private readonly actions$: Actions, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.actions$
      .pipe(
        ofType(AuthActions.logInCode),
        tap(() => {
          this.step = 2;
          this.reloadForm();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleBack() {
    this.step = 1;
    this.form.value.code = null;
    this.reloadForm();
  }

  reloadForm() {
    this.showLogin = this.step === 1;
    this.showCode = this.step === 2;
    this.cdr.detectChanges();
  }

  handleFormSubmit() {
    const loginPayload = { ...this.form.value, application: 'exeros-panel-app' };

    if (this.step === 1) {
      loginPayload.code = undefined;
    }

    this.store.dispatch(AuthActions.logIn({ body: loginPayload }));
  }
}
