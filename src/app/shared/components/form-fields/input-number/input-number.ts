import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    input,
    output,
    signal
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'input-number-field',
    templateUrl: 'input-number.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./input-number.scss'],
    imports: [CommonModule, ReactiveFormsModule],
})
export class InputNumberComponent {
    id = signal<string>('input-number-' + Math.random().toString(36).substring(2));
    label = input<string>('');
    placeholder = input<string>('');
    error = input<string>('');
    control = input<FormControl>(new FormControl(''));
    min = input<number | undefined>(undefined);
    max = input<number | undefined>(undefined);
    step = input<number>(1);
    valueChange = output<number>();

    onBlur() {
        if (this.control().valid) {
            const numValue = parseFloat(this.control().value) || 0;
            this.valueChange.emit(numValue);
        }
    }

    onInput(event: Event) {
        const target = event.target as HTMLInputElement;
        const value = target.value;

        // Remove any non-numeric characters except decimal point
        const numericValue = value.replace(/[^0-9.]/g, '');

        // Ensure only one decimal point
        const parts = numericValue.split('.');
        if (parts.length > 2) {
            const cleanValue = parts[0] + '.' + parts.slice(1).join('');
            this.control().setValue(cleanValue);
            return;
        }

        if (numericValue !== value) {
            this.control().setValue(numericValue);
        }
    }
}