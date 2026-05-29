import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { TokenService } from '../services/token.service';

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
        notificationService.error('Cannot connect to server');
      } else {
        notificationService.error(message);
      }

      return throwError(() => error);
    })
  );
};