import { Component, output, signal } from '@angular/core';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

export interface IccidValidationFormData {
  iccid: string;
  puk: string;
}

@Component({
  selector: 'app-iccid-validation-form',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextComponent],
  templateUrl: './iccid-validation-form.html',
  styleUrl: './iccid-validation-form.scss'
})
export class IccidValidationForm {

  formSubmit = output<IccidValidationFormData>();

  // Error messages map
  errorMessages: Record<string, Record<string, string>> = {
    lovNumber: {
      pattern: 'El número debe tener 10 dígitos numéricos' // TODO: Update message as needed
    },
    iccidDigits: {
      pattern: 'El campo debe tener 8 dígitos numéricos' // TODO: Update message as needed
    }
  };

  form = signal(
    new FormGroup({
      iccid: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]), // TODO: Update pattern as needed
      puk: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{8}$')]),
    })
  );

  // Get error message for a specific field
  getFieldErrorMessage(fieldName: string): string {
    const control = this.form().get(fieldName);
    if (!control?.errors || !control.touched) return '';

    const firstError = Object.keys(control.errors)[0];

    // Validators.required automatically shows 'Este campo es obligatorio'
    if (firstError === 'required') return 'Este campo es obligatorio';

    // Field-specific messages
    const fieldErrors = this.errorMessages[fieldName];
    return fieldErrors?.[firstError] || 'Error de validación';
  }

  onSubmit(): void {
    if (this.form().valid) {
      this.formSubmit.emit(this.form().value as IccidValidationFormData);
    }
    // console.log('Form submitted:', this.form().value);
  }
}
