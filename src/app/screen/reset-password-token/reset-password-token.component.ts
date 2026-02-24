import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import RouteConst from 'src/app/const/route';
import { AuthActions } from '../../store/auth/auth.actions';

@Component({
  templateUrl: './reset-password-token.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordTokenComponent {
  readonly ROUTE_CONST = RouteConst;

  form = new UntypedFormGroup({
    password: new UntypedFormControl(''),
    password_confirmation: new UntypedFormControl(''),
    token: new UntypedFormControl(this.route.snapshot.paramMap.get('token') ?? '')
  });

  constructor(private readonly store: Store, private readonly route: ActivatedRoute) {}

  handleFormSubmit() {
    this.store.dispatch(AuthActions.changePassword({ body: this.form.value }));
  }
}
