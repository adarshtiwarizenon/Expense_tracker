import { AbstractControl, ValidationErrors } from '@angular/forms';

export function noFutureDate(control: AbstractControl): ValidationErrors | null {
  const val: Date = control.value;
  if (!val) return null;
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return val > endOfToday ? { futureDate: true } : null;
}

export function strongPassword(control: AbstractControl): ValidationErrors | null {
  const v: string = control.value || '';
  if (!v) return null;
  const hasUpper = /[A-Z]/.test(v);
  const hasDigit = /[0-9]/.test(v);
  const hasSpecial = /[^A-Za-z0-9]/.test(v);
  return hasUpper && hasDigit && hasSpecial ? null : { weakPassword: true };
}

// Validators.required passes for "   " because it's truthy — this closes that gap.
export function noWhitespace(control: AbstractControl): ValidationErrors | null {
  const val: string = control.value || '';
  return val.length > 0 && val.trim().length === 0 ?
  { whitespace: true } : null;
}

// Group-level — apply on the FormGroup, not a single control.
export function passwordMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}
