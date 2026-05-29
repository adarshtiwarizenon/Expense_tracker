import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private pending = 0;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  show(): void {
    this.pending++;
    if (this.pending === 1) this.loadingSubject.next(true);
  }

  hide(): void {
    if (this.pending > 0) this.pending--;
    if (this.pending === 0) this.loadingSubject.next(false);
  }
}
