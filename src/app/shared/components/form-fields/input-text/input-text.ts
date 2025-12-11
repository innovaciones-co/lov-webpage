import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

// Predefined autocomplete values based on HTML autocomplete attribute specification
export type AutocompleteValue =
  | 'off'
  | 'on'
  | 'name'
  | 'given-name'
  | 'family-name'
  | 'email'
  | 'username'
  | 'new-password'
  | 'current-password'
  | 'tel'
  | 'tel-national'
  | 'street-address'
  | 'address-line1'
  | 'address-line2'
  | 'country'
  | 'country-name'
  | 'postal-code'
  | 'cc-name'
  | 'cc-number'
  | 'cc-exp'
  | 'cc-csc'
  | 'bday';

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
  autocomplete = input<AutocompleteValue>('off');
  valueChange = output<string>();

  onBlur() {
    if (this.control().valid) {
      this.valueChange.emit(this.control().value);
    }
  }
}
