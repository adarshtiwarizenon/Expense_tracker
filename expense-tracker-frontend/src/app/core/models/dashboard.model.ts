import { BudgetUtilization } from './budget.model';
import { Transaction } from './transaction.model';

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  recentTransactions: Transaction[];
  budgetAlerts: BudgetUtilization[];
}
