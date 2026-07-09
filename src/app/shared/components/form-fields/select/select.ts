import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  EventEmitter,
  signal,
  effect,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'select-field',
  templateUrl: './select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./select.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class SelectComponent {
  id = signal<string>('select-' + Math.random().toString(36).substring(2));
  label = input<string>('');
  placeholder = input<string>('');
  error = input<string>('');
  disabled = input<boolean>(false);
  options = input<{ label: string; value: string }[]>([]);
  control = input<FormControl>(new FormControl(''));
  valueChange = output<string>();

  constructor() {
    effect(() => {
      if (this.disabled()) {
        this.control().disable({ emitEvent: false });
      } else {
        this.control().enable({ emitEvent: false });
      }
    });
  }

  onBlur() {
    if (this.control().valid) {
      this.valueChange.emit(this.control().value);
    }
  }
}
