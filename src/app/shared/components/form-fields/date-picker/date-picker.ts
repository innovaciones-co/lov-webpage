import {
  Component,
  ChangeDetectionStrategy,
  effect,
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
  // Typed as DD/MM/AAAA with the slashes added on their own, instead of picked from a calendar:
  // quicker for dates far back, like a document's issue date. The control still gets YYYY-MM-DD.
  typed = input(false);
  valueChange = output<string>();

  text = signal('');
  // A full date that doesn't exist, like 31/02/2020.
  impossible = signal(false);
  private typing = false;

  constructor() {
    // Shows in the typed field a value the form already has or sets later.
    effect((onCleanup) => {
      const control = this.control();
      const show = (value: unknown) => {
        if (this.typing) return;
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
          const [year, month, day] = value.slice(0, 10).split('-');
          this.text.set(`${day}/${month}/${year}`);
        } else if (!value) {
          this.text.set('');
        }
        this.impossible.set(false);
      };
      show(control.value);
      const subscription = control.valueChanges.subscribe(show);
      onCleanup(() => subscription.unsubscribe());
    });
  }

  onContainerClick() {
    this.dateInput.nativeElement.focus();
    this.dateInput.nativeElement.showPicker();
  }

  onType(event: Event) {
    const field = event.target as HTMLInputElement;
    const adding = (event as InputEvent).inputType?.startsWith('insert') ?? true;
    let digits = '';
    for (const digit of field.value.replace(/\D/g, '')) {
      // A day can't start with 4-9 nor a month with 2-9: that's the whole number, so pad it.
      if ((digits.length === 0 && digit > '3') || (digits.length === 2 && digit > '1')) digits += '0';
      digits += digit;
    }
    digits = digits.slice(0, 8);

    let text = digits.slice(0, 2);
    if (digits.length > 2 || (adding && digits.length === 2)) text += '/' + digits.slice(2, 4);
    if (digits.length > 4 || (adding && digits.length === 4)) text += '/' + digits.slice(4);
    field.value = text;
    this.text.set(text);

    const iso = digits.length === 8 ? this.toIso(digits) : null;
    this.impossible.set(digits.length === 8 && !iso);
    const control = this.control();
    this.typing = true;
    if (control.value !== iso) control.setValue(iso);
    this.typing = false;
    control.markAsDirty();
  }

  onBlur() {
    if (this.typed()) this.control().markAsTouched();
    if (this.control().valid) {
      const dateString = this.control().value;
      if (dateString) {
        // ISO string, no Date object
        const isoString = `${dateString}T00:00:00.000Z`;
        this.valueChange.emit(isoString);
      }
    }
  }

  // DDMMYYYY to YYYY-MM-DD, or null when that day doesn't exist.
  private toIso(digits: string): string | null {
    const day = +digits.slice(0, 2);
    const month = +digits.slice(2, 4);
    const year = +digits.slice(4);
    const date = new Date(year, month - 1, day);
    if (year < 1900 || date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
    return `${digits.slice(4)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
  }
}
