import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  EventEmitter,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'date-picker',
  template: `
    <label [attr.for]="id()">{{ label() }}</label>
    <input
      [id]="id()"
      type="date"
      [formControl]="control()"
      [attr.aria-label]="label()"
      (blur)="onBlur()"
      [class.invalid]="control().invalid && control().touched"
    />
    @if (control().invalid && control().touched) {
    <div class="error">{{ error() }}</div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./date-picker.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class DatePickerComponent {
  id = signal<string>('date-' + Math.random().toString(36).substring(2));
  label = input<string>('');
  error = input<string>('');
  control = input<FormControl>(new FormControl(''));
  valueChange = output<string>();

  onBlur() {
    if (this.control().valid) {
      this.valueChange.emit(this.control().value);
    }
  }
}
