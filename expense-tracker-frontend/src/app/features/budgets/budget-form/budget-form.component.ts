import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { Budget, BudgetRequest } from '../../../core/models/budget.model';
import { Category } from '../../../core/models/category.model';
import { DateUtil } from '../../../core/utils/date.util';

@Component({
  selector: 'app-budget-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DatePicker,
    DialogModule,
    DividerModule,
    InputNumberModule,
    Message,
    Select,
  ],
  templateUrl: './budget-form.component.html',
})
export class BudgetFormComponent implements OnChanges {
  private fb = inject(FormBuilder);

  @Input() visible = false;
  @Input() editingBudget: Budget | null = null;
  @Input() categories: Category[] = [];
  @Input() serverError = '';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<BudgetRequest>();

  form = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    monthDate: [new Date(), Validators.required],
    categoryId: [null as number | null, Validators.required],
  });

  // Only show EXPENSE categories
  get expenseCategories(): Category[] {
    return this.categories.filter((c) => c.type === 'EXPENSE');
  }

  ngOnChanges(changes: SimpleChanges): void {
    const editingChanged = !!changes['editingBudget'];
    const becameVisible =
      !!changes['visible'] && changes['visible'].currentValue === true;

    if (editingChanged || becameVisible) {
      if (this.editingBudget) {
        const [year, month] = this.editingBudget.month.split('-');
        this.form.patchValue({
          amount: this.editingBudget.amount,
          monthDate: new Date(+year, +month - 1, 1),
          categoryId: this.editingBudget.categoryId,
        });
      } else {
        this.form.reset({
          monthDate: new Date(),
        });
      }

    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const monthStr = DateUtil.toMonthString(value.monthDate as Date);

    const request: BudgetRequest = {
      amount: value.amount!,
      month: monthStr,
      categoryId: value.categoryId!,
    };

    this.save.emit(request);
  }

  onCancel(): void {
    this.visibleChange.emit(false);
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }
}