import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

interface ApiErrorResponse {
  message: string;
  errors: Record<string, string[]>;
}

@Injectable({
  providedIn: 'root'
})
export class FormErrorService {
  mapApiErrors(form: FormGroup, error: any): void {
    this.clearServerErrors(form);

    if (!error?.error) return;

    const apiError = error.error as ApiErrorResponse;
    if (!apiError.errors) return;

    Object.entries(apiError.errors).forEach(([fieldName, errorMessages]) => {
      const control = form.get(fieldName);
      if (control) {
        const currentErrors = control.errors ?? {};
        control.setErrors({
          ...currentErrors,
          serverError: errorMessages[0]
        });
        control.markAsTouched();
      }
    });
  }

  clearServerErrors(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control?.errors?.['serverError']) {
        const { serverError, ...otherErrors } = control.errors;
        control.setErrors(Object.keys(otherErrors).length > 0 ? otherErrors : null);
      }
    });
  }
}
