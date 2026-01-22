import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'error-card',
  imports: [CommonModule],
  templateUrl: './error-card.html',
  styleUrl: './error-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorCard {
  message = input<string>('');
}
