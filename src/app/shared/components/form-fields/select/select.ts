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
  selector: 'select',
  template: `
    <label [attr.for]="id()">{{ label() }}</label>
    <select
      [id]="id()"
      [formControl]="control()"
      [attr.aria-label]="label()"
      (blur)="onBlur()"
      [class.invalid]="control().invalid && control().touched"
    >
      @for (option of options(); track option.value) {
      <option [value]="option.value">{{ option.label }}</option>
      }
    </select>
    @if (control().invalid && control().touched) {
    <div class="error">{{ error() }}</div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./select.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class SelectComponent {
  id = signal<string>('select-' + Math.random().toString(36).substring(2));
  label = input<string>('');
  error = input<string>('');
  options = input<{ label: string; value: string }[]>([]);
  control = input<FormControl>(new FormControl(''));
  valueChange = output<string>();

  onBlur() {
    if (this.control().valid) {
      this.valueChange.emit(this.control().value);
    }
  }
}
