export interface CategoryDistribution {
  categoryId: number;
  categoryName: string;
  totalAmount: number;
  percentage: number;
}

export interface MonthlyComparison {
  month: string;
  income: number;
  expense: number;
  savings: number;
}

export interface ExpenseTrend {
  date: string;
  amount: number;
}

export interface AnalyticsMetrics {
  savingsRatio: number;
  highestSpendingCategory: string;
  highestSpendingAmount: number;
  currentMonthExpenses: number;
  previousMonthExpenses: number;
  monthOverMonthChange: number;
}