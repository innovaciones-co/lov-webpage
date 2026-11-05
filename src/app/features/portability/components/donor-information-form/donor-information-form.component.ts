import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { combineLatest, debounceTime, filter } from 'rxjs';
import { ErrorCard } from "../../../../shared/components/error-card/error-card";
import { Modal } from '../../../../shared/components/modal/modal';
import { PortabilityService } from '../../services/portability.service';
import { PortabilityInformationData } from '../portability-information-form/portability-information-form.component';

export interface DonorInformationData {
  donorNumber: string;
  donorOperator: string;
  donorOperatorCode?: string;
  donorPlan: string;
}

type NumberField = 'donorNumber' | 'donorNumberConfirm';

@Component({
  selector: 'app-donor-information-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Modal,
    ErrorCard
  ],
  templateUrl: './donor-information-form.component.html',
  styleUrl: './donor-information-form.component.scss'
})
export class DonorInformationFormComponent {
  private portabilityService = inject(PortabilityService);

  portabilityData = input.required<PortabilityInformationData>();
  // What the customer already entered, when they come back to this step.
  initial = input<DonorInformationData | null>(null);
  formSubmit = output<DonorInformationData>();

  showModal = signal(false);
  isLoading = signal(false);
  isLookingUp = signal(false);
  validationError = signal<string>('');

  // Error messages map
  errorMessages: Record<string, Record<string, string>> = {
    donorNumber: {
      pattern: 'Escribe los 10 dígitos; empieza por 3',
      operatorNotDetected: 'No pudimos detectar el operador de este número. Revísalo.'
    },
    donorNumberConfirm: {
      pattern: 'Escribe los 10 dígitos; empieza por 3',
      mismatch: 'No coincide con el número de arriba'
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
      donorNumber: new FormControl('', [Validators.required, Validators.pattern('^3[0-9]{9}$')]),
      donorNumberConfirm: new FormControl('', [Validators.required, Validators.pattern('^3[0-9]{9}$'), this.matchValidator('donorNumber')]),
      donorOperator: new FormControl('', Validators.required),
      donorOperatorCode: new FormControl('', Validators.required),
      donorPlan: new FormControl('', Validators.required),
    })
  );

  private readonly values = toSignal(this.form().valueChanges, { initialValue: this.form().value });
  readonly numbersMatch = computed(() => {
    const { donorNumber, donorNumberConfirm } = this.values();
    return !!donorNumber && donorNumber.length === 10 && donorNumber === donorNumberConfirm;
  });

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

    effect(() => {
      const initial = this.initial();
      if (!initial) return;
      this.form().patchValue({
        donorNumber: initial.donorNumber,
        donorNumberConfirm: initial.donorNumber,
        donorPlan: initial.donorPlan,
      });
    });
  }

  planOptions = signal([
    { label: 'Prepago', value: 'PREPAID' },
    { label: 'Pospago', value: 'POSTPAID' },
  ]);

  count(field: NumberField): number {
    return (this.values()[field] ?? '').length;
  }

  // Digits only, cut to 10, as the customer types or pastes (a pasted 57 is dropped).
  onDigits(field: NumberField, input: HTMLInputElement): void {
    let digits = input.value.replace(/[^0-9]/g, '');
    if (digits.length > 10 && digits.startsWith('57')) digits = digits.slice(2);
    digits = digits.slice(0, 10);
    input.value = digits;
    this.form().controls[field].setValue(digits);
  }

  showError(field: NumberField): boolean {
    const control = this.form().controls[field];
    return control.invalid && control.touched;
  }

  private async lookupDonorOperator(donorNumber: string): Promise<void> {
    // Clear any previous operator detection errors
    const donorNumberControl = this.form().get('donorNumber');
    const donorOperatorControl = this.form().get('donorOperator');
    const donorOperatorCodeControl = this.form().get('donorOperatorCode');

    if (donorNumberControl?.errors?.['operatorNotDetected']) {
      const { operatorNotDetected, ...otherErrors } = donorNumberControl.errors;
      const hasOtherErrors = Object.keys(otherErrors).length > 0;
      donorNumberControl.setErrors(hasOtherErrors ? otherErrors : null);
    }

    this.isLookingUp.set(true);
    const lookupResult = await this.portabilityService.lookupByMsisdn(donorNumber);
    this.isLookingUp.set(false);

    if (lookupResult && lookupResult.operatorCode) {
      donorOperatorCodeControl?.setValue(lookupResult.operatorCode);
      donorOperatorControl?.setValue(lookupResult.operatorName);
    } else {
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
      // getRawValue: the operator field is disabled (detected, not typed) but is part of the data.
      const formData = this.form().getRawValue() as DonorInformationData;
      const lovNumber = this.portabilityData().lovNumber;
      await this.portabilityService.nipRequest(formData, lovNumber);

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
