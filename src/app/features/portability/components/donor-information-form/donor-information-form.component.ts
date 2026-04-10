import { Component, inject, input, output, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { combineLatest, debounceTime, filter } from 'rxjs';
import { ErrorCard } from "../../../../shared/components/error-card/error-card";
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { SelectComponent } from "../../../../shared/components/form-fields/select/select";
import { Modal } from '../../../../shared/components/modal/modal';
import { PortabilityService } from '../../services/portability.service';
import { PortabilityInformationData } from '../portability-information-form/portability-information-form.component';

export interface DonorInformationData {
  donorNumber: string;
  donorOperator: string;
  donorPlan: string;
}

@Component({
  selector: 'app-donor-information-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextComponent,
    SelectComponent,
    Modal,
    ErrorCard
  ],
  templateUrl: './donor-information-form.component.html',
  styleUrl: './donor-information-form.component.scss'
})
export class DonorInformationFormComponent {
  private portabilityService = inject(PortabilityService);

  portabilityData = input.required<PortabilityInformationData>();
  formSubmit = output<DonorInformationData>();

  showModal = signal(false);
  isLoading = signal(false);
  validationError = signal<string>('');

  // Error messages map
  errorMessages: Record<string, Record<string, string>> = {
    donorNumber: {
      pattern: 'El número debe tener 10 dígitos numéricos',
      operatorNotDetected: 'No se pudo detectar el operador de este número'
    },
    donorNumberConfirm: {
      pattern: 'El número debe tener 10 dígitos numéricos',
      mismatch: 'El número de la SIM Lov no coincide'
    }
  };

  // Validator
  private matchValidator = (targetFieldName: string): ValidatorFn => {
    return (control: AbstractControl) => {
      if (!control.parent) return null;

      const targetField = control.parent.get(targetFieldName);
      if (!targetField) return null;

      if (!control.value && !targetField.value) return null;

      return control.value !== targetField.value ? { mismatch: true } : null;
    };
  };

  form = signal(
    new FormGroup({
      donorNumber: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
      donorNumberConfirm: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$'), this.matchValidator('donorNumber')]),
      donorOperator: new FormControl('', Validators.required),
      donorOperatorCode: new FormControl('', Validators.required),
      donorPlan: new FormControl('', Validators.required),
    })
  );

  constructor() {
    const donorNumberControl = this.form().get('donorNumber');
    const donorNumberConfirmControl = this.form().get('donorNumberConfirm');
    const donorOperator = this.form().get('donorOperator');

    // Keep donorOperator disabled to prevent manual editing
    donorOperator?.disable();

    if (donorNumberControl && donorNumberConfirmControl) {
      // Cross-field validation
      donorNumberControl.valueChanges.subscribe(() => {
        donorNumberConfirmControl.updateValueAndValidity();
      });

      // Auto-lookup with both fields
      combineLatest([
        donorNumberControl.valueChanges,
        donorNumberConfirmControl.valueChanges
      ]).pipe(
        debounceTime(500),
        filter(([num1, num2]) => {
          return num1 === num2 &&
            donorNumberControl.valid &&
            donorNumberConfirmControl.valid &&
            !donorNumberConfirmControl.errors?.['mismatch'];
        })
      ).subscribe(([donorNumber]) => {
        if (donorNumber) {
          this.lookupDonorOperator(donorNumber);
        }
      });
    }
  }

  planOptions = signal([
    { label: 'Pospago', value: 'POSTPAID' },
    { label: 'Prepago', value: 'PREPAID' },
  ]);

  private async lookupDonorOperator(donorNumber: string): Promise<void> {
    console.debug(`Looking up donor operator for number: ${donorNumber}`);

    // Clear any previous operator detection errors
    const donorNumberControl = this.form().get('donorNumber');
    const donorOperatorControl = this.form().get('donorOperator');
    const donorOperatorCodeControl = this.form().get('donorOperatorCode');

    if (donorNumberControl?.errors?.['operatorNotDetected']) {
      const { operatorNotDetected, ...otherErrors } = donorNumberControl.errors;
      const hasOtherErrors = Object.keys(otherErrors).length > 0;
      donorNumberControl.setErrors(hasOtherErrors ? otherErrors : null);
    }

    const lookupResult = await this.portabilityService.lookupByMsisdn(donorNumber);

    if (lookupResult && lookupResult.operatorCode) {
      donorOperatorCodeControl?.setValue(lookupResult.operatorCode);
      donorOperatorControl?.setValue(lookupResult.operatorName);
    } else {
      console.log('Donor operator could not be detected.');
      // Set error on the donor number field to show in the input
      donorNumberControl?.setErrors({
        ...donorNumberControl?.errors,
        operatorNotDetected: true
      });
      donorNumberControl?.markAsTouched(); // Mark as touched to ensure error displays

      donorOperatorCodeControl?.setValue(null);
      donorOperatorControl?.setValue(null);
    }
  }

  // Get error message for a specific field
  getFieldErrorMessage(fieldName: string): string {
    const control = this.form().get(fieldName);
    if (!control?.errors || !control.touched) return '';

    const firstError = Object.keys(control.errors)[0];
    console.log(`First error for field ${fieldName}:`, firstError);

    if (firstError === 'required') return 'Este campo es obligatorio';

    return this.errorMessages[fieldName]?.[firstError] || 'Error de validación';
  }

  onSubmit(): void {
    if (this.form().valid) {
      this.showModal.set(true);
    }
  }

  async onContinueModal(): Promise<void> {
    this.validationError.set('');
    this.isLoading.set(true);

    try {
      const formData = this.form().value as DonorInformationData;
      const lovNumber = this.portabilityData().lovNumber;
      //await this.portabilityService.nipRequest(formData, lovNumber);

      this.formSubmit.emit(formData);
      this.showModal.set(false);
    } catch (error: any) {
      console.error('Error submitting donor request:', error);

      let errorMessage = 'Error al procesar la solicitud de portabilidad. Por favor, inténtelo de nuevo más tarde o contacte al equipo de soporte.';
      if (error?.status === 429) {
        errorMessage = 'Parece que ya hemos enviado varios códigos de verificación recientemente a tu número de teléfono. Por favor, contacte al equipo de soporte para más información.';
      } else if (error?.error?.message) {
        errorMessage = error.error.message;
      }

      this.validationError.set(errorMessage);

      this.showModal.set(false);
    } finally {
      this.isLoading.set(false);
    }
  }

  onCancelModal(): void {
    this.showModal.set(false);
  }

}
