import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator that checks if a value is a multiple of 1000
 * @returns ValidatorFn
 */
export function multipleOf1000Validator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;

        // Allow empty values (use Validators.required separately if needed)
        if (value === null || value === undefined || value === '') {
            return null;
        }

        const numValue = Number(value);

        // Check if it's a valid number
        if (isNaN(numValue)) {
            return { multipleOf1000: { value, message: 'Value must be a number' } };
        }

        // Check if it's a multiple of 1000
        if (numValue % 1000 !== 0) {
            return { multipleOf1000: { value, message: 'Value must be a multiple of 1000' } };
        }

        return null;
    };
}