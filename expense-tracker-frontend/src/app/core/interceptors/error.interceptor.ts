import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { TokenService } from '../services/token.service';

// Global HTTP error handler — toasts errors and force-logout on 401.
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const tokenService = inject(TokenService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'An unexpected error occurred';

      if (error.error?.message) {
        message = error.error.message;
      } else if (error.error?.errors?.length > 0) {
        message = error.error.errors.join(', ');
      }

      if (error.status === 401) {
        tokenService.clear();
        router.navigate(['/auth/login']);
        notificationService.error('Session expired. Please login again.');
      } else if (error.status === 0) {
        // Request never reached server (network/CORS/backend down).
        notificationService.error('Cannot connect to server');
      } else {
        notificationService.error(message);
      }

      // Re-throw so component handlers can react too.
      return throwError(() => error);
    })
  );
};