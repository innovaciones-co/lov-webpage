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
  documentType: string;
  documentID: string;
  documentIssueDate: Date;
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
    SelectComponent,
    DatePickerComponent],
  templateUrl: './personal-info-form.html',
  styleUrl: './personal-info-form.scss'
})
export class PersonalInfoForm {
  private activateSimService = inject(ActivateSimService);
  private router = inject(Router);

  documentValidated = signal<boolean>(false);

  // Error messages map (only specific validations, required is automatic)
  errorMessages: Record<string, Record<string, string>> = {
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

  form = signal(
    new FormGroup({
      name: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      documentType: new FormControl('', Validators.required),
      documentID: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{7,15}$')]),
      documentIssueDate: new FormControl<Date | null>(null, Validators.required),
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

  onValidateDocument(): void {
    const documentID = this.form().get('documentID')?.value;
    const documentType = this.form().get('documentType')?.value;
    const documentIssueDate = this.form().get('documentIssueDate')?.value;

    // Validar que los campos requeridos estén completos
    if (!documentID || !documentType || !documentIssueDate) {
      return;
    }

    this.activateSimService.validateDocument(documentID, documentType, documentIssueDate).subscribe({
      next: (response) => {
        console.log('Documento validado exitosamente:', response);
        this.activateSimService.setLoading(false);
        this.documentValidated.set(true);

        // Prellenar los campos con la información del documento si viene en la respuesta
        if (response?.name) this.form().get('name')?.setValue(response.name);
        if (response?.lastName) this.form().get('lastName')?.setValue(response.lastName);
      },
      error: (error) => {
        console.error('Error al validar documento:', error);
        this.activateSimService.setLoading(false);
        this.documentValidated.set(false);
      }
    });
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
