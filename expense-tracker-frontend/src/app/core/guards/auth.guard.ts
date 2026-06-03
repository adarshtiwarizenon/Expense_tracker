import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Protects all routes that require the user to be logged in (e.g. /transactions, /dashboard).
// Applied in app.routes.ts on the main layout route.
// If no token exists, redirects to login page and blocks navigation.
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true; // token exists — allow navigation
  }
  router.navigate(['/auth/login']);
  return false; // no token — block and redirect
};