import { Routes } from '@angular/router';

// Auth feature routes — registered under /auth in the main app routes
// loadComponent uses lazy loading: the login/signup bundles are only downloaded when the user navigates to these pages
export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./signup/signup.component').then((m) => m.SignupComponent),
  },
  // /auth with no sub-path defaults to /auth/login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];