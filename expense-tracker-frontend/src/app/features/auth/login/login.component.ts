import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    CardModule,
    DividerModule,
    InputTextModule,
    MessageModule,
    PasswordModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  loading = false;   // disables the submit button and shows spinner while request is in-flight
  serverError = '';  // shown as a red message banner above the form when the backend rejects login

  // Reactive form with client-side validation — email format + password min length
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit(): void {
    // markAllAsTouched triggers validation messages to appear on all fields even if the user never focused them
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.serverError = '';
    this.loading = true;

    this.authService.login(this.loginForm.value as any).subscribe({
      next: () => {
        // AuthService.handleAuthSuccess already saved the token — just notify and redirect
        this.notification.success('Welcome back!');
        this.router.navigate(['/transactions']);
      },
      error: (err) => {
        // errorInterceptor shows a global toast, but we also show inline error for wrong credentials
        this.serverError = err.error?.message || 'Login failed. Please try again.';
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }

  // Helper used in the template to show red validation text under a field
  isInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && control.touched);
  }
}