export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: number;
  amount: number;
  type: TransactionType;
  date: string;
  description?: string;
  paymentMethod?: string;
  categoryId: number;
  categoryName: string;
  createdAt: string;
}

export interface TransactionRequest {
  amount: number;
  type: TransactionType;
  date: string;
  description?: string;
  paymentMethod?: string;
  categoryId: number;
}

export interface TransactionFilters {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
  type?: TransactionType;
  categoryIds?: number[];
  startDate?: string;
  endDate?: string;
}