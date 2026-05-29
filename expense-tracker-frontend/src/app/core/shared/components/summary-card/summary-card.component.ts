import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { CurrencyInrPipe } from '../../pipes/currency-inr.pipe';

export type SummaryCardVariant = 'income' | 'expense' | 'balance' | 'savings';

@Component({
  selector: 'app-summary-card',
  standalone: true,
  imports: [CommonModule, CardModule, SkeletonModule, CurrencyInrPipe],
  template: `
    <p-card [styleClass]="'summary-card ' + variant">
      <ng-container *ngIf="loading; else loaded">
        <p-skeleton height="80px"></p-skeleton>
      </ng-container>
      <ng-template #loaded>
        <div class="card-body">
          <div class="card-icon" [class]="variant + '-icon'">
            <i [class]="icon"></i>
          </div>
          <div>
            <div class="card-label">{{ label }}</div>
            <div class="card-value">{{ value | inr }}</div>
          </div>
        </div>
      </ng-template>
    </p-card>
  `,
  styleUrls: ['./summary-card.component.scss'],
})
export class SummaryCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) icon!: string;
  @Input({ required: true }) variant!: SummaryCardVariant;
  @Input() value: number | null | undefined = 0;
  @Input() loading = false;
}
