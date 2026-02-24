import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from 'src/app/service/http/http.service';
import { ChangePasswordBody, LoginBody, LoginResponse, LogoutResponse, ResetPasswordBody, UserResponse } from 'src/app/store/auth/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private readonly http: HttpService) {}

  logIn(body: LoginBody): Observable<LoginResponse> {
    return this.http.post$<LoginResponse>('auth/login', body);
  }

  resetPassword(body: ResetPasswordBody): Observable<any> {
    return this.http.post$('reset-password', body);
  }

  changePassword(body: ChangePasswordBody): Observable<any> {
    return this.http.post$('change-password', body);
  }

  fetchUser(): Observable<UserResponse> {
    return this.http.get$<UserResponse>('auth/user');
  }

  logOut(): Observable<LogoutResponse> {
    return this.http.get$<LogoutResponse>('auth/logout');
  }
}
