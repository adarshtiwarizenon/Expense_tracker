import { environment } from '../../../environments/environment';

const BASE = environment.apiUrl;

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${BASE}/auth/register`,
    LOGIN: `${BASE}/auth/login`,
  },
  CATEGORIES: {
    BASE: `${BASE}/categories`,
    BY_ID: (id: number) => `${BASE}/categories/${id}`,
  },
  TRANSACTIONS: {
    BASE: `${BASE}/transactions`,
    BY_ID: (id: number) => `${BASE}/transactions/${id}`,
  },
  DASHBOARD: {
    SUMMARY: `${BASE}/dashboard/summary`,
  },
  BUDGETS: {
    BASE: `${BASE}/budgets`,
    BY_ID: (id: number) => `${BASE}/budgets/${id}`,
    UTILIZATION: `${BASE}/budgets/utilization`,
  },
  ANALYTICS: {
    CATEGORY_DISTRIBUTION: `${BASE}/analytics/category-distribution`,
    MONTHLY_COMPARISON: `${BASE}/analytics/monthly-comparison`,
    EXPENSE_TREND: `${BASE}/analytics/expense-trend`,
    METRICS: `${BASE}/analytics/metrics`,
  },
  INSIGHTS: {
    BASE: `${BASE}/insights`,
  },
  RECURRING: {
    BASE: `${BASE}/recurring`,
    BY_ID: (id: number) => `${BASE}/recurring/${id}`,
    TRIGGER: `${BASE}/recurring/trigger-now`,
  },
  REPORTS: {
    EXPORT: `${BASE}/reports/export`,
  },
};