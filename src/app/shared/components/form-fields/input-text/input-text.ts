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
  selector: 'input-text-field',
  templateUrl: 'input-text.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./input-text.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class InputTextComponent {
  id = signal<string>('input-' + Math.random().toString(36).substring(2));
  label = input<string>('');
  placeholder = input<string>('');
  error = input<string>('');
  control = input<FormControl>(new FormControl(''));
  valueChange = output<string>();

  onBlur() {
    if (this.control().valid) {
      this.valueChange.emit(this.control().value);
    }
  }
}
