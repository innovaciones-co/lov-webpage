import { Component, signal, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';

export interface PortabilityStatusComponentData {
  lovNumber: string;
}

@Component({
  selector: 'app-portability-status',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextComponent],
  templateUrl: './portability-status.html',
  styleUrl: './portability-status.scss'
})
export class PortabilityStatusComponent {

  formSubmit = output<PortabilityStatusComponentData>();

  // Error messages map
  errorMessages: Record<string, Record<string, string>> = {
    lovNumber: {
      pattern: 'El número debe tener 10 dígitos numéricos'
    }
  };

  form = signal(
    new FormGroup({
      lovNumber: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
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
      this.formSubmit.emit(this.form().value as PortabilityStatusComponentData);
    }
    console.log('Form submitted:', this.form().value);
  }

}
