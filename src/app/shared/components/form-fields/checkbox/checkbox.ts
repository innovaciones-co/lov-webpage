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
  templateUrl: './checkbox.html',
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
