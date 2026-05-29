import { TransactionType } from './transaction.model';

export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface RecurringTransaction {
  id: number;
  amount: number;
  type: TransactionType;
  frequency: Frequency;
  nextExecution: string;
  description?: string;
  categoryId: number;
  categoryName: string;
}

export interface RecurringTransactionRequest {
  amount: number;
  type: TransactionType;
  frequency: Frequency;
  nextExecution: string;
  description?: string;
  categoryId: number;
}