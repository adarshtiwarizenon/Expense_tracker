import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Message } from 'primeng/message';
import { PanelModule } from 'primeng/panel';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { CurrencyInrPipe } from '../../../core/shared/pipes/currency-inr.pipe';
import { SeverityPipe } from '../../../core/shared/pipes/severity.pipe';
import { PageToolbarComponent } from '../../../core/shared/components/page-toolbar/page-toolbar.component';
import { ConfirmDirective } from '../../../core/shared/directives/confirm.directive';
import {
  Budget,
  BudgetRequest,
  BudgetUtilization,
} from '../../../core/models/budget.model';
import { Category } from '../../../core/models/category.model';
import { NotificationService } from '../../../core/services/notification.service';
import { CategoryService } from '../../categories/category.service';
import { BudgetFormComponent } from '../budget-form/budget-form.component';
import { BudgetService } from '../budget.service';
import { environment } from '../../../../environments/environment';
import { DateUtil } from '../../../core/utils/date.util';

@Component({
  selector: 'app-budget-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    BudgetFormComponent,
    DatePicker,
    Message,
    PanelModule,
    ProgressBarModule,
    SkeletonModule,
    TableModule,
    TagModule,
    TooltipModule,
    PageToolbarComponent,
    CurrencyInrPipe,
    SeverityPipe,
    ConfirmDirective,
  ],
  templateUrl: './budget-list.component.html',
  styleUrls: ['./budget-list.component.scss'],
})
export class BudgetListComponent implements OnInit {
  private budgetService = inject(BudgetService);
  private categoryService = inject(CategoryService);
  private notification = inject(NotificationService);

  private budgetsSubject = new BehaviorSubject<Budget[]>([]);
  private utilizationSubject = new BehaviorSubject<BudgetUtilization[]>([]);
  budgets$ = this.budgetsSubject.asObservable();
  utilization$ = this.utilizationSubject.asObservable();

  categories: Category[] = [];
  loading = false;

  dialogVisible = false;
  editingBudget: Budget | null = null;
  budgetServerError = '';

  filterMonth: Date = new Date();

  defaultPageSize = environment.defaultPageSize;
  pageSizeOptions = environment.pageSizeOptions;

  ngOnInit(): void {
    this.loadCategories();
    this.loadData();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (data) => (this.categories = data),
      error: (err) => console.error('Failed to load categories', err),
    });
  }

  loadData(): void {
    this.loading = true;
    const monthStr = DateUtil.toMonthString(this.filterMonth);

    forkJoin({
      budgets: this.budgetService.getAll(),
      utilization: this.budgetService.getUtilization(monthStr),
    }).subscribe({
      next: ({ budgets, utilization }) => {
        this.budgetsSubject.next(budgets);
        this.utilizationSubject.next(utilization);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load budgets', err);
        this.loading = false;
      },
    });
  }

  onMonthChange(): void {
    this.loadData();
  }

  openCreateDialog(): void {
    this.editingBudget = null;
    this.budgetServerError = '';
    this.dialogVisible = true;
  }

  openEditDialog(budget: Budget): void {
    this.editingBudget = budget;
    this.budgetServerError = '';
    this.dialogVisible = true;
  }

  onSave(request: BudgetRequest): void {
    const obs = this.editingBudget
      ? this.budgetService.update(this.editingBudget.id, request)
      : this.budgetService.create(request);

    obs.subscribe({
      next: () => {
        this.notification.success(this.editingBudget ? 'Budget updated' : 'Budget created');
        this.dialogVisible = false;
        this.loadData();
      },
      error: (err) => {
        this.budgetServerError = err.error?.message || 'Failed to save budget';
      },
    });
  }

  deleteOptimistic(budget: Budget): void {
    const snapshot = this.budgetsSubject.value;
    this.budgetsSubject.next(snapshot.filter((b) => b.id !== budget.id));

    this.budgetService.delete(budget.id).subscribe({
      next: () => {
        this.notification.success('Budget deleted');
        this.loadData();
      },
      error: (err) => {
        this.budgetsSubject.next(snapshot);
        console.error('Failed to delete budget', err);
      },
    });
  }

  trackById(_index: number, item: { id: number }): number {
    return item.id;
  }

  trackByBudgetId(_index: number, item: BudgetUtilization): number {
    return item.budgetId;
  }
}
