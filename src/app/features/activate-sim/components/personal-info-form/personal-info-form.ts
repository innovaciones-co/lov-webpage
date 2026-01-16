import { Component, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { SelectComponent } from '../../../../shared/components/form-fields/select/select';
import { Router } from '@angular/router';
import { ActivateSimService } from '../../services/activate-sim.service';
import { DatePickerComponent } from "../../../../shared/components/form-fields/date-picker/date-picker";

export interface PersonalInfoFormData {
  name: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  city: string;
  address: string;
  addressOptional: string;
}

@Component({
  selector: 'app-personal-info-form',
  imports: [ReactiveFormsModule,
    InputTextComponent,
    SelectComponent
  ],
  templateUrl: './personal-info-form.html',
  styleUrl: './personal-info-form.scss'
})
export class PersonalInfoForm {
  private activateSimService = inject(ActivateSimService);
  private router = inject(Router);

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
      name: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      phoneNumber: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
      country: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      addressOptional: new FormControl(''),
    })
  );

  country = signal([
    { label: 'Colombia', value: 'colombia' },
  ]);

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
      /* const formData = this.form().value as PersonalInfoFormData;
      this.activateSimService.submitPersonalInfo(formData);
      this.formSubmit.emit(formData); */
      // this.router.navigate(['/portability/successful']);
    }
  }
}
