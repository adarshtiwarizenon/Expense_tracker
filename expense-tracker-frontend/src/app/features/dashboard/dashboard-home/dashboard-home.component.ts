import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { ProgressBarModule } from 'primeng/progressbar';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CurrencyInrPipe } from '../../../core/shared/pipes/currency-inr.pipe';
import { SeverityPipe } from '../../../core/shared/pipes/severity.pipe';
import { SummaryCardComponent } from '../../../core/shared/components/summary-card/summary-card.component';
import { PageToolbarComponent } from '../../../core/shared/components/page-toolbar/page-toolbar.component';
import { BudgetStatus, BudgetUtilization } from '../../../core/models/budget.model';
import { DashboardSummary } from '../../../core/models/dashboard.model';
import { DashboardService } from '../dashboard.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    CardModule,
    DividerModule,
    MessageModule,
    ProgressBarModule,
    SkeletonModule,
    TableModule,
    TagModule,
    TooltipModule,
    CurrencyInrPipe,
    SeverityPipe,
    SummaryCardComponent,
    PageToolbarComponent,
  ],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss'],
})
export class DashboardHomeComponent {
  private dashboardService = inject(DashboardService);

  loading = false;

  private refresh$ = new BehaviorSubject<void>(undefined);
  summary$: Observable<DashboardSummary | null> = this.refresh$.pipe(
    tap(() => (this.loading = true)),
    switchMap(() => this.dashboardService.getSummary()),
    tap(() => (this.loading = false))
  );

  loadSummary(): void {
    this.refresh$.next();
  }

  getProgressColor(status: BudgetStatus): string {
    if (status === 'EXCEEDED') return '#ef4444';
    if (status === 'WARNING') return '#f59e0b';
    return '#22c55e';
  }

  trackById(_index: number, item: { id: number }): number {
    return item.id;
  }

  trackByBudgetId(_index: number, item: BudgetUtilization): number {
    return item.budgetId;
  }
}
