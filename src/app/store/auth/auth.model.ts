import { AccessGroup, NotificationType } from 'src/app/screen/settings/settings.model';
import { HttpResponse } from 'src/app/service/http/http.model';
import { CompanyElement } from '../../screen/settings/settings.model';

export interface LoginBody {
  email: string;
  password: string;
  application: string;
  remember_me?: boolean;
}

export interface LoginData {
  access_token: string;
  token_type: string;
  expires_at: string;
  inactivity_status: string;
}

export interface LoginCodeData {
  status: string;
}

export type LoginResponse = HttpResponse<LoginData> | HttpResponse<LoginCodeData>;

export interface ResetPasswordBody {
  email: string;
}

export interface ChangePasswordBody {
  password: string;
  password_confirmation: string;
  token: string;
}

export type LicenseRenewalRemindMeBefore = 'DAY' | 'WEEK' | 'TWO_WEEKS' | 'MONTH';

export type ReviewerLevel = 'LEVEL_1' | 'LEVEL_2';

export interface UserData {
  id: number;
  name: string;
  reviewer_level: ReviewerLevel;
  email: string;
  avatar: string;
  role: string;
  license_renewal_date?: string;
  license_renewal_remind_me_before?: LicenseRenewalRemindMeBefore[];
  allowed_notifications: NotificationType[];
  access_groups: AccessGroup[];
  company_id: number;
  company_fleet_accesses: number[];
  is_mfa_enabled: boolean;
  can_mfa_be_disabled: boolean;
  video_timeout: number;
}

export type UserResponse = HttpResponse<UserData>;
export type CompanyResponse = HttpResponse<CompanyElement>;

export interface LogoutData {
  message: string;
}

export type LogoutResponse = HttpResponse<LogoutData>;
