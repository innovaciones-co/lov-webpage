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
  selector: 'radio-field',
  template: `
    <fieldset>
      <legend>{{ label() }}</legend>
      @for (option of options(); track option.value) {
      <input
        type="radio"
        [id]="id() + '-' + option.value"
        [formControl]="control()"
        [value]="option.value"
        [attr.name]="id()"
        (blur)="onBlur()"
      />
      <label [attr.for]="id() + '-' + option.value">{{ option.label }}</label>
      }
    </fieldset>
    @if (control().invalid && control().touched) {
    <div class="error">{{ error() }}</div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./radio.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class RadioComponent {
  id = signal<string>('radio-' + Math.random().toString(36).substring(2));
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
