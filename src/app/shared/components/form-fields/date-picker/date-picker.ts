import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  ViewChild,
  ElementRef,
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
  @ViewChild('dateInput') dateInput!: ElementRef<HTMLInputElement>;

  id = signal<string>('date-' + Math.random().toString(36).substring(2));
  label = input<string>('');
  error = input<string>('');
  placeholder = input<string>('');
  control = input<FormControl>(new FormControl(''));
  valueChange = output<string>();

  onContainerClick() {
    this.dateInput.nativeElement.focus();
    this.dateInput.nativeElement.showPicker();
  }

  onBlur() {
    if (this.control().valid) {
      const dateString = this.control().value;
      if (dateString) {
        // ISO string, no Date object
        const isoString = `${dateString}T00:00:00.000Z`;
        this.valueChange.emit(isoString);
      }
    }
  }
}
