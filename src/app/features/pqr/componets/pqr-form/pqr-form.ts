import { Component, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextComponent } from "../../../../shared/components/form-fields/input-text/input-text";
import { SelectComponent } from "../../../../shared/components/form-fields/select/select";
import { Router } from '@angular/router';
import { CheckboxComponent } from "../../../../shared/components/form-fields/checkbox/checkbox";
import { PqrService } from '../../Services/pqr.service';

export interface PqrFormData {
  requestType: string;
  subject: string;
  message: string;
  email: string;
  phone: string;
  fullName: string;
  terms: boolean;
}

@Component({
  selector: 'app-pqr-form',
  imports: [ReactiveFormsModule, InputTextComponent, SelectComponent, CheckboxComponent],
  templateUrl: './pqr-form.html',
  styleUrl: './pqr-form.scss'
})
export class PqrForm {
  private router = inject(Router);
  private pqrService = inject(PqrService);

  // Error messages map (only specific validations, required is automatic)
  errorMessages: Record<string, Record<string, string>> = {
    email: {
      email: 'Ingresa un correo válido'
    },
    phone: {
      pattern: 'El teléfono debe tener 10 dígitos numéricos'
    }
  };

  form = signal(
    new FormGroup({
      requestType: new FormControl('', Validators.required),
      subject: new FormControl('', Validators.required),
      message: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
      fullName: new FormControl('', Validators.required),
      terms: new FormControl(false, Validators.requiredTrue),
    })
  );

  requestType = signal([
    { label: 'Petición', value: 'REQUEST' },
    { label: 'Queja', value: 'COMPLAINT' },
    { label: 'Reclamo', value: 'CLAIM' },
  ]);

  formSubmit = output<PqrFormData>();

  // Get error message for a specific field
  getFieldErrorMessage(fieldName: string): string {
    const control = this.form().get(fieldName);
    if (!control?.errors || !control.touched) return '';

    const firstError = Object.keys(control.errors)[0];

    // Validators.required automatically shows 'Este campo es obligatorio'
    if (firstError === 'required') return 'Este campo es obligatorio';

    // Use field-specific message for any non-required error
    return this.errorMessages[fieldName]?.[firstError] || 'Error de validación';
  }

  async onSubmit(): Promise<void> {
    if (this.form().valid) {
      try {
        const formData = this.form().value as PqrFormData;
        await this.pqrService.submitPqr(formData);
        this.formSubmit.emit(formData);
      } catch (error) {
        console.error('Error submitting PQR form:', error);
      }
    }
  }
}
