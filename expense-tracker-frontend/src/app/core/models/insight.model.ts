export type InsightType = 'INFO' | 'WARNING' | 'ALERT';

export interface Insight {
  type: InsightType;
  message: string;
  category?: string;
}