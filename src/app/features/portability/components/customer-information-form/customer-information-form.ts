import { Component, signal, output, inject, input } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, AbstractControl, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { PortabilityService } from '../../services/portability.service';
import { CheckboxComponent } from '../../../../shared/components/form-fields/checkbox/checkbox';
import { DatePickerComponent } from '../../../../shared/components/form-fields/date-picker/date-picker';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { SelectComponent } from "../../../../shared/components/form-fields/select/select";
import { ErrorCard } from "../../../../shared/components/error-card/error-card";

export interface CustomerInformationData {
  nip: string;
  portinDate: string;
  fullName: string;
  documentType: string;
  documentID: string;
  documentIssueDate: string;
  address: string;
}

@Component({
  selector: 'app-customer-information-form',
  imports: [
    ReactiveFormsModule,
    InputTextComponent,
    SelectComponent,
    DatePickerComponent,
    ErrorCard
  ],
  templateUrl: './customer-information-form.html',
  styleUrl: './customer-information-form.scss'
})
export class CustomerInformationFormComponent {
  private router = inject(Router);
  private portabilityService = inject(PortabilityService);

  donorData = input.required<any>();
  portabilityData = input.required<any>();

  isLoading = signal(false);
  submitError = signal<string>('');

  // Error messages map (only specific validations, required is automatic)
  errorMessages: Record<string, Record<string, string>> = {
    nip: {
      pattern: 'El NIP debe tener el formato correcto'
    },
    portinDate: {
      futureDate: 'La fecha debe ser posterior a hoy'
    },
    documentIssueDate: {
      pastDate: 'La fecha debe ser anterior a hoy'
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

  // Past date validator
  private pastDateValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return null;

      // The date-picker component now handles the date format correctly
      const dateValue = control.value;
      const [year, month, day] = dateValue.split('-').map(Number);

      // Create dates in local timezone
      const selectedDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return selectedDate < today ? null : { pastDate: true };
    };
  }

  form = signal(
    new FormGroup({
      nip: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{5}$')]),
      portinDate: new FormControl('', [Validators.required, this.futureDateValidator()]),
      fullName: new FormControl('', Validators.required),
      documentType: new FormControl('', Validators.required),
      documentID: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{7,15}$')]),
      documentIssueDate: new FormControl('', [Validators.required, this.pastDateValidator()]),
      address: new FormControl('', Validators.required),
    })
  );

  documentType = signal([
    { label: 'Cédula', value: 'ID' },
    { label: 'Cédula de extranjeria', value: 'foreignID' },
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

  async onSubmit(): Promise<void> {
    if (!this.form().valid) return;

    this.isLoading.set(true);
    this.submitError.set('');

    try {
      await this.portabilityService.submitPortability(
        this.form().value as CustomerInformationData,
        this.donorData(),
        this.portabilityData()
      );

      this.formSubmit.emit(this.form().value as CustomerInformationData);
      await this.router.navigate(['/portability/successful']);
    } catch (error: any) {
      const errorMessage = error?.error?.message ||
        'Error al procesar la solicitud de portabilidad. Por favor, inténtelo de nuevo más tarde o contacte con soporte para más información.';
      this.submitError.set(errorMessage);
      console.error('Error submitting portability request:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

}
