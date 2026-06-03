import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Opposite of authGuard — applied on /auth/login and /auth/signup routes.
// Prevents already-logged-in users from visiting the login/signup pages again.
// If token exists, redirects to /transactions instead.
export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true; // not logged in — allow access to login/signup
  }
  router.navigate(['/transactions']);
  return false; // already logged in — redirect away from auth pages
};