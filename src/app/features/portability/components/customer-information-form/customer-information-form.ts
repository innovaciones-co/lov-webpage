import { Component, signal, output, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, AbstractControl, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { CheckboxComponent } from '../../../../shared/components/form-fields/checkbox/checkbox';
import { DatePickerComponent } from '../../../../shared/components/form-fields/date-picker/date-picker';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { SelectComponent } from "../../../../shared/components/form-fields/select/select";

export interface CustomerInformationData {
  nip: string;
  portinDate: string;
  name: string;
  lastName: string;
  documentType: string;
  documentID: string;
  email: string;
  phoneNumber: string;
  country: string;
  city: string;
  address: string;
  addressOptional: string;
}

@Component({
  selector: 'app-customer-information-form',
  imports: [
    ReactiveFormsModule,
    InputTextComponent,
    SelectComponent,
    DatePickerComponent
  ],
  templateUrl: './customer-information-form.html',
  styleUrl: './customer-information-form.scss'
})
export class CustomerInformationFormComponent {
  private router = inject(Router);
  
  // Error messages map (only specific validations, required is automatic)
  errorMessages: Record<string, Record<string, string>> = {
    nip: {
      pattern: 'El NIP debe tener el formato correcto'
    },
    portinDate: {
      futureDate: 'La fecha debe ser posterior a hoy'
    },
    email: {
      email: 'Ingrese un email válido'
    },
    phoneNumber: {
      pattern: 'El teléfono debe tener 10 dígitos numéricos'
    },
    documentID: {
      pattern: 'El documento debe tener el formato correcto'
    }
  };

  // Future date validator
  private futureDateValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return null;

      // The date-picker component now handles the date format correctly
      const dateValue = control.value;
      const [year, month, day] = dateValue.split('-').map(Number);

      // Create dates in local timezone
      const selectedDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return selectedDate > today ? null : { futureDate: true };
    };
  }

  form = signal(
    new FormGroup({
      nip: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{5}$')]),
      portinDate: new FormControl('', [Validators.required, this.futureDateValidator()]),
      name: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      documentType: new FormControl('', Validators.required),
      documentID: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{7,15}$')]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phoneNumber: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
      country: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      addressOptional: new FormControl(''),
    })
  );

  documentType = signal([
    { label: 'Cédula', value: 'ID' },
    { label: 'Cédula de extranjeria', value: 'foreignID' },
  ]);

  country = signal([
    { label: 'Colombia', value: 'colombia' },
  ]);

  formSubmit = output<CustomerInformationData>();

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
      this.formSubmit.emit(this.form().value as CustomerInformationData);
      this.router.navigate(['/portability/successful']);
    }
  }

}
