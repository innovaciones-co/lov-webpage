import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    input,
    output,
    signal,
    viewChildren
} from '@angular/core';
import {
    AbstractControl,
    FormArray,
    FormControl,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn
} from '@angular/forms';

@Component({
    selector: 'otp-input-field',
    templateUrl: 'otp-input.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./otp-input.scss'],
    imports: [CommonModule, ReactiveFormsModule],
})
export class OtpInputComponent {
    inputRefs = viewChildren<ElementRef>('otpInput');

    label = input<string>('');
    error = input<string>('');
    control = input<FormArray>(new FormArray([
        new FormControl(''),
        new FormControl(''),
        new FormControl(''),
        new FormControl(''),
        new FormControl(''),
        new FormControl('')
    ], [this.otpCompleteValidator()]));

    otpComplete = output<string>();
    otpChange = output<string>();

    // Create an array for template iteration
    otpInputs = signal(Array.from({ length: 6 }, (_, i) => i));

    // Custom validator to check if OTP is complete
    private otpCompleteValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (control instanceof FormArray) {
                const otpValue = control.controls
                    .map(ctrl => ctrl.value || '')
                    .join('');

                if (otpValue.length < 6) {
                    return { otpIncomplete: true };
                }
            }
            return null;
        };
    }

    // Helper method to get FormControl from FormArray
    getControl(index: number): FormControl {
        return this.control().at(index) as FormControl;
    }

    onInput(event: Event, index: number) {
        const target = event.target as HTMLInputElement;
        const value = target.value;

        // Only allow single digit
        const numericValue = value.replace(/[^0-9]/g, '').slice(-1);

        if (numericValue !== value) {
            this.getControl(index).setValue(numericValue);
            target.value = numericValue;
        }

        // Auto-focus next input if value entered
        if (numericValue && index < 5) {
            const nextInput = this.inputRefs()[index + 1]?.nativeElement;
            if (nextInput) {
                nextInput.focus();
            }
        }

        this.emitOtpValue();
    }

    onKeyDown(event: KeyboardEvent, index: number) {
        const target = event.target as HTMLInputElement;

        // Handle backspace
        if (event.key === 'Backspace') {
            if (!target.value && index > 0) {
                // Move to previous input if current is empty
                const prevInput = this.inputRefs()[index - 1]?.nativeElement;
                if (prevInput) {
                    prevInput.focus();
                    prevInput.select();
                }
            } else {
                // Clear current input
                this.getControl(index).setValue('');
                target.value = '';
                this.emitOtpValue();
            }
        }
        // Handle arrow keys
        else if (event.key === 'ArrowLeft' && index > 0) {
            event.preventDefault();
            const prevInput = this.inputRefs()[index - 1]?.nativeElement;
            if (prevInput) {
                prevInput.focus();
            }
        }
        else if (event.key === 'ArrowRight' && index < 5) {
            event.preventDefault();
            const nextInput = this.inputRefs()[index + 1]?.nativeElement;
            if (nextInput) {
                nextInput.focus();
            }
        }
    }

    onPaste(event: ClipboardEvent) {
        event.preventDefault();
        const paste = event.clipboardData?.getData('text') || '';
        const digits = paste.replace(/[^0-9]/g, '').slice(0, 6);

        // Fill inputs with pasted digits
        for (let i = 0; i < 6; i++) {
            const digit = digits[i] || '';
            this.getControl(i).setValue(digit);
            const input = this.inputRefs()[i]?.nativeElement;
            if (input) {
                input.value = digit;
            }
        }

        // Focus last filled input or first empty one
        const lastFilledIndex = Math.min(digits.length - 1, 5);
        const focusIndex = digits.length < 6 ? lastFilledIndex + 1 : lastFilledIndex;
        const inputToFocus = this.inputRefs()[focusIndex]?.nativeElement;
        if (inputToFocus) {
            inputToFocus.focus();
        }

        this.emitOtpValue();
    }

    private emitOtpValue() {
        const otpValue = this.control().controls
            .map(control => control.value || '')
            .join('');

        this.otpChange.emit(otpValue);

        // Mark the FormArray as touched for validation
        this.control().markAsTouched();

        // Update validity
        this.control().updateValueAndValidity();

        // Emit complete event if all 6 digits are filled
        if (otpValue.length === 6) {
            this.otpComplete.emit(otpValue);
        }
    }

    hasError(): boolean {
        return this.control().invalid && this.control().touched;
    }

    getErrorMessage(): string {
        if (this.control().errors?.['otpIncomplete']) {
            return this.error() || 'Please complete the OTP';
        }
        return this.error();
    }
}