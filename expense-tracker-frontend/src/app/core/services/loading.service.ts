import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private pending = 0;
  private loadingState = signal<boolean>(false);
  loading = this.loadingState.asReadonly();

  show(): void {
    this.pending++;
    if (this.pending === 1) setTimeout(() => this.loadingState.set(true));
  }

  hide(): void {
    if (this.pending > 0) this.pending--;
    if (this.pending === 0) setTimeout(() => this.loadingState.set(false));
  }
}
