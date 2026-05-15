import { Component, inject, output, signal, OnInit, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { SelectComponent } from '../../../../shared/components/form-fields/select/select';
import { Router } from '@angular/router';
import { DeviceLockService } from '../../services/device-lock.service';
import { ErrorCard } from "../../../../shared/components/error-card/error-card";

export interface PersonalInfoFormData {
  email: string;
  phoneNumber: string;
  city: string;
  address: string;
  addressOptional: string;
  imei: string;
}

@Component({
  selector: 'app-personal-info-form',
  imports: [ReactiveFormsModule,
    InputTextComponent,
    SelectComponent, ErrorCard],
  templateUrl: './personal-info-form.html',
  styleUrl: './personal-info-form.scss'
})
export class PersonalInfoForm {
  private router = inject(Router);
  private deviceLockService = inject(DeviceLockService);

  imeiList = input<{ label: string; value: string }[]>([]);
  validationError = signal<string>('');

  // Error messages map (only specific validations, required is automatic)
  errorMessages: Record<string, Record<string, string>> = {
    email: {
      email: 'Ingrese un email válido'
    },
    phoneNumber: {
      pattern: 'El teléfono debe tener 10 dígitos numéricos'
    }
  };

  form = signal(
    new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      phoneNumber: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
      city: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      addressOptional: new FormControl(''),
      imei: new FormControl('', Validators.required),
    })
  );

  formSubmit = output<PersonalInfoFormData>();

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

  onSubmit(): void {
    if (this.form().valid) {
      this.formSubmit.emit(this.form().value as PersonalInfoFormData);
    }
  }
}
