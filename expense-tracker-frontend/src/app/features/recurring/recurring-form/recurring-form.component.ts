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
import { RadioButtonModule } from 'primeng/radiobutton';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { Category } from '../../../core/models/category.model';
import {
  Frequency,
  RecurringTransaction,
  RecurringTransactionRequest,
} from '../../../core/models/recurring.model';
import { TransactionType } from '../../../core/models/transaction.model';
import { DateUtil } from '../../../core/utils/date.util';

@Component({
  selector: 'app-recurring-form',
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
    RadioButtonModule,
    Select,
    Textarea,
  ],
  templateUrl: './recurring-form.component.html',
})
export class RecurringFormComponent implements OnChanges {
  private fb = inject(FormBuilder);

  @Input() visible = false;
  @Input() editingRecurring: RecurringTransaction | null = null;
  @Input() categories: Category[] = [];
  @Input() serverError = '';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<RecurringTransactionRequest>();

  today = new Date();

  frequencyOptions = [
    { label: 'Daily', value: 'DAILY' as Frequency },
    { label: 'Weekly', value: 'WEEKLY' as Frequency },
    { label: 'Monthly', value: 'MONTHLY' as Frequency },
  ];

  form = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    type: ['EXPENSE' as TransactionType, Validators.required],
    frequency: ['MONTHLY' as Frequency, Validators.required],
    nextExecution: [new Date(), Validators.required],
    description: [''],
    categoryId: [null as number | null, Validators.required],
  });

  ngOnChanges(changes: SimpleChanges): void {
    const editingChanged = !!changes['editingRecurring'];
    const becameVisible =
      !!changes['visible'] && changes['visible'].currentValue === true;

    if (editingChanged || becameVisible) {
      if (this.editingRecurring) {
        this.form.patchValue({
          amount: this.editingRecurring.amount,
          type: this.editingRecurring.type,
          frequency: this.editingRecurring.frequency,
          nextExecution: new Date(this.editingRecurring.nextExecution),
          description: this.editingRecurring.description || '',
          categoryId: this.editingRecurring.categoryId,
        });
      } else {
        this.form.reset({
          type: 'EXPENSE',
          frequency: 'MONTHLY',
          nextExecution: new Date(),
          description: '',
        });
      }

    }
  }

  get filteredCategories(): Category[] {
    const selectedType = this.form.get('type')?.value;
    return this.categories.filter((c) => c.type === selectedType);
  }

  onTypeChange(): void {
    this.form.patchValue({ categoryId: null });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const request: RecurringTransactionRequest = {
      amount: value.amount!,
      type: value.type!,
      frequency: value.frequency!,
      nextExecution: DateUtil.toLocalDateString(value.nextExecution as Date),
      description: value.description || undefined,
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