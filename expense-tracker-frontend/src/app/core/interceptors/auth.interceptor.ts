import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';

// Runs automatically before every HTTP request.
// Attaches the JWT from localStorage as an Authorization header so the backend can identify the user.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.getToken();

  if (token) {
    // HTTP requests are immutable — clone the request and add the header, then pass the clone forward
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(cloned);
  }

  // No token (user not logged in) — send the request as-is (will hit public endpoints like /auth/login)
  return next(req);
};
