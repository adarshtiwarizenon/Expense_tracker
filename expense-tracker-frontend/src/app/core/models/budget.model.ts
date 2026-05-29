export interface Budget {
  id: number;
  amount: number;
  month: string;
  categoryId: number;
  categoryName: string;
}

export interface BudgetRequest {
  amount: number;
  month: string;
  categoryId: number;
}

export type BudgetStatus = 'NORMAL' | 'WARNING' | 'EXCEEDED';

export interface BudgetUtilization {
  budgetId: number;
  categoryId: number;
  categoryName: string;
  month: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  utilizationPercentage: number;
  status: BudgetStatus;
}