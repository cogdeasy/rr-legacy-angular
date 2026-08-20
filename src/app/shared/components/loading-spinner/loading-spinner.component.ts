import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="spinner-overlay" *ngIf="isLoading">
      <div class="spinner-container">
        <mat-spinner [diameter]="diameter" color="primary"></mat-spinner>
        <p *ngIf="message">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .spinner-overlay {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
    }
    .spinner-container {
      text-align: center;
    }
    .spinner-container p {
      margin-top: 16px;
      color: var(--rr-slate);
      font-size: 0.9rem;
    }
    mat-spinner {
      margin: 0 auto;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() isLoading = false;
  @Input() message = '';
  @Input() diameter = 48;
}
