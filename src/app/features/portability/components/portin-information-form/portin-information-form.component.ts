import { Component, signal, output, effect } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, AbstractControl, ValidatorFn } from '@angular/forms';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { SelectComponent } from "../../../../shared/components/form-fields/select/select";
import { Modal } from '../../../../shared/components/modal/modal';

export interface PortinInformationData {
  donorNumber: string;
  donorOperator: string;
  donorPlan: string;
}

@Component({
  selector: 'app-portin-information-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextComponent,
    SelectComponent,
    Modal
  ],
  templateUrl: './portin-information-form.component.html',
  styleUrl: './portin-information-form.component.scss'
})
export class PortinInformationFormComponent {
  formSubmit = output<PortinInformationData>();

  showModal = signal(false);

  // Error messages map
  errorMessages: Record<string, Record<string, string>> = {
    donorNumber: {
      pattern: 'El número debe tener 10 dígitos numéricos'
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
      donorPlan: new FormControl('', Validators.required),
    })
  );

  constructor() {
    // Setup cross-field validation when form is accessed
    effect(() => {
      const formInstance = this.form();
      const donorNumberControl = formInstance.get('donorNumber');
      const donorNumberConfirmControl = formInstance.get('donorNumberConfirm');

      if (donorNumberControl && donorNumberConfirmControl) {
        donorNumberControl.valueChanges.subscribe(() => {
          donorNumberConfirmControl.updateValueAndValidity();
        });
      }
    });
  }

  donorOperator = signal([
    { label: 'Claro', value: 'claro' },
    { label: 'Tigo', value: 'tigo' },
  ]);

  planOptions = signal([
    { label: 'Pospago', value: 'pospay' },
    { label: 'Prepago', value: 'pospaid' },
  ]);

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

  onContinueModal(): void {
    this.formSubmit.emit(this.form().value as PortinInformationData);
    this.showModal.set(false);
  }

  onCancelModal(): void {
    this.showModal.set(false);
  }

}
