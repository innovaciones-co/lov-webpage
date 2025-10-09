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
  selector: 'date-picker-field',
  templateUrl: './date-picker.html',
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
