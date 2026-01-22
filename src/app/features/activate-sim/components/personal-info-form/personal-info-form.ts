import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { SelectComponent } from '../../../../shared/components/form-fields/select/select';
import { Router } from '@angular/router';
import { ActivateSimService } from '../../services/activate-sim.service';
import { DatePickerComponent } from "../../../../shared/components/form-fields/date-picker/date-picker";
import { COLOMBIA_STATES } from '../../../../core/constants/colombia-states';
import { CheckboxComponent } from "../../../../shared/components/form-fields/checkbox/checkbox";
import { DocumentValidationData } from '../document-validation/document-validation';

export interface PersonalInfoFormData {
  name: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  state: string;
  city: string;
  address: string;
  addressOptional: string;
  terms: boolean;
}

@Component({
  selector: 'app-personal-info-form',
  imports: [ReactiveFormsModule,
    InputTextComponent,
    SelectComponent,
    CheckboxComponent,
  ],
  templateUrl: './personal-info-form.html',
  styleUrl: './personal-info-form.scss'
})
export class PersonalInfoForm {
  private activateSimService = inject(ActivateSimService);
  private router = inject(Router);
  documentValidationData = input<DocumentValidationData | null>(null);

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
      state: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      addressOptional: new FormControl(''),
      terms: new FormControl(false, Validators.requiredTrue),
    })
  );

  country = signal([
    { label: 'Colombia', value: 'colombia' },
  ]);

  state = signal(COLOMBIA_STATES);

  formSubmit = output<PersonalInfoFormData>();

  constructor() {
    effect(() => {
      const validationData = this.activateSimService.getDocumentValidationData()();

      if (validationData) {
        if (validationData.detailsGivenName) {
          this.form().get('name')?.setValue(validationData.detailsGivenName);
        }
        if (validationData.detailsFamilyName) {
          this.form().get('lastName')?.setValue(validationData.detailsFamilyName);
        }
        if (validationData.contactEmail) {
          this.form().get('email')?.setValue(validationData.contactEmail);
        }
        if (validationData.contactPhone) {
          this.form().get('phoneNumber')?.setValue(validationData.contactPhone);
        }
        if (validationData.addressCity) {
          const city = validationData.addressCity.split('(')[0].trim();
          this.form().get('city')?.setValue(city);
        }
        if (validationData.addressLine1) {
          this.form().get('address')?.setValue(validationData.addressLine1);
        }
        if (validationData.addressCountry === 'Co') {
          this.form().get('country')?.setValue('colombia');
        }

        Object.keys(this.form().controls).forEach(key => {
          this.form().get(key)?.markAsTouched();
        });
      }
    });
  }

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
      const formData = this.form().value as PersonalInfoFormData;
      const documentData = this.documentValidationData();

      this.activateSimService.activateSim(formData, documentData).subscribe({
        next: (response) => {
          console.log('Activación exitosa:', response);
          this.activateSimService.setLoading(false);
          this.formSubmit.emit(formData);
          this.router.navigate(['/activar-sim/exitoso']);
        },
        error: (error) => {
          console.error('Error en la activación:', error);
          this.activateSimService.setLoading(false);
        }
      });
    }
  }
}
