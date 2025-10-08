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
  selector: 'checkbox-field',
  template: `
    <label [attr.for]="id()">
      <input type="checkbox" [id]="id()" [formControl]="control()" (blur)="onBlur()" />
      {{ label() }}
    </label>
    @if (control().invalid && control().touched) {
    <div class="error">{{ error() }}</div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./checkbox.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class CheckboxComponent {
  id = signal<string>('checkbox-' + Math.random().toString(36).substring(2));
  label = input<string>('');
  error = input<string>('');
  control = input<FormControl>(new FormControl(false));
  valueChange = output<boolean>();

  onBlur() {
    if (this.control().valid) {
      this.valueChange.emit(this.control().value);
    }
  }
}
