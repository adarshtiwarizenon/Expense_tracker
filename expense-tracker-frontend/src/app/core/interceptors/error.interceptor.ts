import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { TokenService } from '../services/token.service';

// Global HTTP error handler — runs after every failed HTTP response.
// Centralizes error handling so components don't each need their own error toast logic.
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const tokenService = inject(TokenService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Default fallback message if backend sends no readable error
      let message = 'An unexpected error occurred';

      // Try to use the backend's error message first
      if (error.error?.message) {
        message = error.error.message;
      } else if (error.error?.errors?.length > 0) {
        // Validation errors array (e.g. from @Valid on DTOs) — join into one string
        message = error.error.errors.join(', ');
      }

      if (error.status === 401) {
        // Token expired or invalid — clear storage and force re-login
        tokenService.clear();
        router.navigate(['/auth/login']);
        notificationService.error('Session expired. Please login again.');
      } else if (error.status === 0) {
        // status 0 means the request never reached the server (network down, CORS blocked, backend offline)
        notificationService.error('Cannot connect to server');
      } else {
        notificationService.error(message);
      }

      // Re-throw so individual component error handlers can still react if needed
      return throwError(() => error);
    })
  );
};