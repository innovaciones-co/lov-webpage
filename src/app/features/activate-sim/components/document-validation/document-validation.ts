import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { SelectComponent } from '../../../../shared/components/form-fields/select/select';
import { Router } from '@angular/router';
import { ActivateSimService } from '../../services/activate-sim.service';
import { DatePickerComponent } from "../../../../shared/components/form-fields/date-picker/date-picker";

export interface DocumentValidationData {
  documentType: string;
  documentID: string;
  documentIssueDate: string;
}

@Component({
  selector: 'app-document-validation',
  imports: [ReactiveFormsModule, InputTextComponent, SelectComponent, DatePickerComponent],
  templateUrl: './document-validation.html',
  styleUrl: './document-validation.scss'
})
export class DocumentValidation {
  private activateSimService = inject(ActivateSimService);
  private router = inject(Router);

  hideButton = input(false);
  isLoading = signal(false);

  // Error messages map (only specific validations, required is automatic)
  errorMessages: Record<string, Record<string, string>> = {
    documentID: {
      pattern: 'El documento debe tener el formato correcto'
    },
    documentIssueDate: {
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
      documentType: new FormControl('', Validators.required),
      documentID: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{7,15}$')]),
      documentIssueDate: new FormControl<string | null>(null, [Validators.required, this.pastDateValidator()]),
    })
  );

  documentType = signal([
    { label: 'Cédula', value: 'ID' },
    { label: 'Cédula de extranjeria', value: 'foreignID' },
  ]);

  formSubmit = output<DocumentValidationData>();

  constructor() {
    effect(() => {
      if (this.hideButton()) {
        this.form().disable();
      } else {
        this.form().enable();
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
      const formData = this.form().value as DocumentValidationData;
      this.isLoading.set(true);

      this.activateSimService.validateDocument(formData.documentID, formData.documentType, formData.documentIssueDate).subscribe({
        next: (response) => {
          console.log('Documento validado exitosamente:', response);
          this.isLoading.set(false);

          if (response?.success && response?.data) {
            this.activateSimService.setDocumentValidationData(response.data);
          }

          this.formSubmit.emit(formData);
        },
        error: (error) => {
          console.error('Error al validar documento:', error);
          this.isLoading.set(false);
        }
      });
    }
  }

}
