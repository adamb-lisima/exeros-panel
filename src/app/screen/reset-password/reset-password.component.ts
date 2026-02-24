import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import RouteConst from 'src/app/const/route';
import { AuthActions } from '../../store/auth/auth.actions';

@Component({
  templateUrl: './reset-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent {
  readonly ROUTE_CONST = RouteConst;
  form = new UntypedFormGroup({
    email: new UntypedFormControl('')
  });

  constructor(private readonly store: Store) {}

  handleFormSubmit() {
    this.store.dispatch(AuthActions.resetPassword({ body: this.form.value }));
  }
}
