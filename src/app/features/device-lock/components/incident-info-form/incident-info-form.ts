import { Component, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { SelectComponent } from '../../../../shared/components/form-fields/select/select';
import { DatePickerComponent } from '../../../../shared/components/form-fields/date-picker/date-picker';
import { Router } from '@angular/router';

export interface IncidentInfoFormData {
  lovNumber: string;
  incidentDate: string;
  blockType: string;
  isMinor: string;
  violenceApplied: string;
}

@Component({
  selector: 'app-incident-info-form',
  imports: [ReactiveFormsModule,
    InputTextComponent,
    SelectComponent,
    DatePickerComponent
  ],
  templateUrl: './incident-info-form.html',
  styleUrl: './incident-info-form.scss'
})
export class IncidentInfoForm {
  private router = inject(Router);

  // Error messages map (only specific validations, required is automatic)
  errorMessages: Record<string, Record<string, string>> = {
    lovNumber: {
      pattern: 'El número LOV debe tener 10 dígitos numéricos'
    },
    incidentDate: {
      pastDate: 'La fecha debe ser anterior o igual a hoy'
    }
  };

  // Past date validator (date must be today or earlier)
  private pastDateValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return null;

      const dateValue = control.value;
      const [year, month, day] = dateValue.split('-').map(Number);

      // Create dates in local timezone
      const selectedDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      return selectedDate <= today ? null : { pastDate: true };
    };
  }

  form = signal(
    new FormGroup({
      lovNumber: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
      incidentDate: new FormControl('', [Validators.required, this.pastDateValidator()]),
      blockType: new FormControl('', Validators.required),
      isMinor: new FormControl('', Validators.required),
      violenceApplied: new FormControl('', Validators.required),
    })
  );

  blockType = signal([
    { label: 'Hurto', value: 'theft' },
    { label: 'Extravío', value: 'loss' },
  ]);

  yesNoOptions = signal([
    { label: 'Sí', value: 'yes' },
    { label: 'No', value: 'no' },
  ]);

  formSubmit = output<IncidentInfoFormData>();

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
      this.formSubmit.emit(this.form().value as IncidentInfoFormData);
    }
  }
}
