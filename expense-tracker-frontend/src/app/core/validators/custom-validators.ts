import { AbstractControl, ValidationErrors } from '@angular/forms';

// Rejects dates after today — used on transaction date field.
// The datepicker already enforces [maxDate] in the UI; this is a form-level safety net.
export function noFutureDate(control: AbstractControl): ValidationErrors | null {
  const val: Date = control.value;
  if (!val) return null;
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return val > endOfToday ? { futureDate: true } : null;
}

// Requires at least one uppercase letter, one digit, and one special character.
// Runs only when the field has a value — minLength handles the empty case.
export function strongPassword(control: AbstractControl): ValidationErrors | null {
  const v: string = control.value || '';
  if (!v) return null;
  const hasUpper = /[A-Z]/.test(v);
  const hasDigit = /[0-9]/.test(v);
  const hasSpecial = /[^A-Za-z0-9]/.test(v);
  return hasUpper && hasDigit && hasSpecial ? null : { weakPassword: true };
}

// Rejects strings that are non-empty but contain only whitespace (e.g. "   ").
// Validators.required passes for "   " because it is truthy — this closes that gap.
export function noWhitespace(control: AbstractControl): ValidationErrors | null {
  const val: string = control.value || '';
  return val.length > 0 && val.trim().length === 0 ? 
  { whitespace: true } : null;
}

// Group-level validator — compares password and confirmPassword sibling controls.
// Must be applied at the FormGroup level, not on an individual control.
export function passwordMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}
