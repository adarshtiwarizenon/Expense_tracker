
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { tap } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { DatePicker } from 'primeng/datepicker';
import { Message } from 'primeng/message';
import { PanelModule } from 'primeng/panel';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import {
  AnalyticsMetrics,
  CategoryDistribution,
  ExpenseTrend,
  MonthlyComparison,
} from '../../../core/models/analytics.model';
import { Insight, InsightType } from '../../../core/models/insight.model';
import { AnalyticsService } from '../analytics.service';
import { DateUtil } from '../../../core/utils/date.util';
import { CurrencyInrPipe } from '../../../core/shared/pipes/currency-inr.pipe';
import { PageToolbarComponent } from '../../../core/shared/components/page-toolbar/page-toolbar.component';

@Component({
  selector: 'app-analytics-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    ChartModule,
    DatePicker,
    Message,
    PanelModule,
    SkeletonModule,
    TagModule,
    TooltipModule,
    PageToolbarComponent,
    CurrencyInrPipe,
  ],
  templateUrl: './analytics-home.component.html',
  styleUrls: ['./analytics-home.component.scss'],
})
export class AnalyticsHomeComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

  // Charts (built as side-effect when data arrives via tap in the stream)
  pieChartData: any;
  pieChartOptions: any;
  barChartData: any;
  barChartOptions: any;
  lineChartData: any;
  lineChartOptions: any;

  // Filters — kept as plain fields so [(ngModel)] still works.
  // Refetch is driven by per-resource tick signals below.
  selectedMonth: Date = new Date();
  trendDateRange: Date[] | null = null;
  trendMaxDate: Date | null = null;

  // Per-resource tick signals — incrementing one re-fires that resource's stream.
  // Separate ticks let us refresh individual sections (e.g. only category on month change).
  private categoryTick = signal(0);
  private comparisonTick = signal(0);
  private trendTick = signal(0);
  private metricsTick = signal(0);
  private insightsTick = signal(0);

  categoryResource = rxResource({
    params: () => this.categoryTick(),
    stream: () =>
      this.analyticsService
        .getCategoryDistribution(DateUtil.toMonthString(this.selectedMonth))
        .pipe(tap((data) => this.updatePieChart(data))),
  });

  comparisonResource = rxResource({
    params: () => this.comparisonTick(),
    stream: () =>
      this.analyticsService
        .getMonthlyComparison(6)
        .pipe(tap((data) => this.updateBarChart(data))),
  });

  trendResource = rxResource({
    params: () => this.trendTick(),
    stream: () => {
      const start = this.trendDateRange?.[0]
        ? DateUtil.toLocalDateString(this.trendDateRange[0])
        : undefined;
      const end = this.trendDateRange?.[1]
        ? DateUtil.toLocalDateString(this.trendDateRange[1])
        : undefined;
      return this.analyticsService
        .getExpenseTrend(start, end)
        .pipe(tap((data) => this.updateLineChart(data)));
    },
  });

  metricsResource = rxResource({
    params: () => this.metricsTick(),
    stream: () => this.analyticsService.getMetrics(),
  });

  insightsResource = rxResource({
    params: () => this.insightsTick(),
    stream: () => this.analyticsService.getInsights(),
  });

  // Convenience signals for the template.
  categoryDistribution = computed<CategoryDistribution[]>(
    () => this.categoryResource.value() ?? []
  );
  monthlyComparison = computed<MonthlyComparison[]>(
    () => this.comparisonResource.value() ?? []
  );
  expenseTrend = computed<ExpenseTrend[]>(() => this.trendResource.value() ?? []);
  metrics = computed<AnalyticsMetrics | null>(() => this.metricsResource.value() ?? null);
  insights = computed<Insight[]>(() => this.insightsResource.value() ?? []);
  loading = computed(() => this.metricsResource.isLoading());

  ngOnInit(): void {
    this.initChartOptions();
  }

  initChartOptions(): void {
    const textColor =
      getComputedStyle(document.documentElement).getPropertyValue('--text-color') ||
      '#495057';
    const surfaceBorder =
      getComputedStyle(document.documentElement).getPropertyValue('--surface-border') ||
      '#dee2e6';

    this.pieChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: textColor } },
      },
    };

    this.barChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: textColor } } },
      scales: {
        x: { ticks: { color: textColor }, grid: { color: surfaceBorder } },
        y: { ticks: { color: textColor }, grid: { color: surfaceBorder }, beginAtZero: true },
      },
    };

    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: textColor } } },
      scales: {
        x: { ticks: { color: textColor }, grid: { color: surfaceBorder } },
        y: { ticks: { color: textColor }, grid: { color: surfaceBorder }, beginAtZero: true },
      },
    };
  }

  loadAll(): void {
    this.categoryTick.update((n) => n + 1);
    this.comparisonTick.update((n) => n + 1);
    this.trendTick.update((n) => n + 1);
    this.metricsTick.update((n) => n + 1);
    this.insightsTick.update((n) => n + 1);
  }

  private updatePieChart(data: CategoryDistribution[]): void {
    const colors = [
      '#6366f1', '#ec4899', '#f59e0b', '#22c55e', '#3b82f6',
      '#ef4444', '#8b5cf6', '#14b8a6', '#f97316', '#eab308',
    ];
    this.pieChartData = {
      labels: data.map((c) => c.categoryName),
      datasets: [
        {
          data: data.map((c) => c.totalAmount),
          backgroundColor: colors,
          hoverBackgroundColor: colors,
        },
      ],
    };
  }

  private updateBarChart(data: MonthlyComparison[]): void {
    this.barChartData = {
      labels: data.map((m) => m.month),
      datasets: [
        { label: 'Income', backgroundColor: '#22c55e', data: data.map((m) => m.income) },
        { label: 'Expense', backgroundColor: '#ef4444', data: data.map((m) => m.expense) },
      ],
    };
  }

  private updateLineChart(data: ExpenseTrend[]): void {
    this.lineChartData = {
      labels: data.map((t) =>
        new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
      ),
      datasets: [
        {
          label: 'Daily Expenses',
          data: data.map((t) => t.amount),
          fill: true,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
        },
      ],
    };
  }

  onTrendDateClear(): void {
    this.trendDateRange = null;
    this.trendMaxDate = null;
    this.trendTick.update((n) => n + 1);
  }

  onMonthChange(): void {
    this.categoryTick.update((n) => n + 1);
  }

  onTrendDateChange(): void {
    const start = this.trendDateRange?.[0];
    const end = this.trendDateRange?.[1];

    if (start && !end) {
      const max = new Date(start);
      max.setDate(max.getDate() + 30);
      this.trendMaxDate = max;
    } else if (start && end) {
      this.trendMaxDate = null;
      this.trendTick.update((n) => n + 1);
    }
  }

  getInsightSeverity(type: InsightType): 'success' | 'info' | 'warn' | 'error' {
    if (type === 'ALERT') return 'error';
    if (type === 'WARNING') return 'warn';
    if (type === 'INFO') return 'info';
    return 'success';
  }

  getMomChangeColor(metrics: AnalyticsMetrics | null | undefined): string {
    if (!metrics) return '';
    return metrics.monthOverMonthChange > 0 ? 'text-red-500' : 'text-green-500';
  }

  trackByInsight(_index: number, item: Insight): string {
    return `${item.type}-${item.message}`;
  }
}
