import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES
          ),
      },
      {
        path: 'transactions',
        loadChildren: () =>
          import('./features/transactions/transaction.routes').then(
            (m) => m.TRANSACTION_ROUTES
          ),
      },
      {
        path: 'categories',
        loadChildren: () =>
          import('./features/categories/category.routes').then(
            (m) => m.CATEGORY_ROUTES
          ),
      },
      {
        path: 'budgets',
        loadChildren: () =>
          import('./features/budgets/budget.routes').then(
            (m) => m.BUDGET_ROUTES
          ),
      },
      {
        path: 'analytics',
        loadChildren: () =>
          import('./features/analytics/analytics.routes').then(
            (m) => m.ANALYTICS_ROUTES
          ),
      },
      {
        path: 'recurring',
        loadChildren: () =>
          import('./features/recurring/recurring.routes').then(
            (m) => m.RECURRING_ROUTES
          ),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./features/reports/reports.routes').then(
            (m) => m.REPORTS_ROUTES
          ),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./core/shared/components/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];