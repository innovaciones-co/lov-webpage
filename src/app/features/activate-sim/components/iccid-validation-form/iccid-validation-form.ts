import { Component, effect, inject, input, output, signal } from '@angular/core';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivateSimService } from '../../services/activate-sim.service';
import { ErrorCard } from '../../../../shared/components/error-card/error-card';

export interface IccidValidationFormData {
  iccid: string;
  puk: string;
}

@Component({
  selector: 'app-iccid-validation-form',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextComponent, ErrorCard],
  templateUrl: './iccid-validation-form.html',
  styleUrl: './iccid-validation-form.scss'
})
export class IccidValidationForm {

  private activateSimService = inject(ActivateSimService);

  hideButton = input(false);
  isLoading = signal(false);
  formSubmit = output<IccidValidationFormData>();

  validationError = signal<string>('');

  // Error messages map
  errorMessages: Record<string, Record<string, string>> = {
    lovNumber: {
      pattern: 'El número debe tener 10 dígitos numéricos' // TODO: Update message as needed
    },
    iccidDigits: {
      pattern: 'El campo debe tener 19 dígitos numéricos'
    }
  };

  form = signal(
    new FormGroup({
      iccid: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{19}$')]),
      puk: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{8}$')]),
    })
  );

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

    // Field-specific messages
    const fieldErrors = this.errorMessages[fieldName];
    return fieldErrors?.[firstError] || 'Error de validación';
  }

  onSubmit(): void {
    if (this.form().valid) {
      const formData = this.form().value as IccidValidationFormData;
      this.isLoading.set(true);

      // Limpiar error previo
      this.validationError.set('');

      this.activateSimService.validateIccid(formData.iccid, formData.puk).subscribe({
        next: (response) => {
          console.log('Validación exitosa:', response);
          this.isLoading.set(false);

          this.activateSimService.setIccidValidationData(response);

          this.formSubmit.emit(formData);
        },
        error: (error) => {
          console.error('Error en la validación:', error);
          this.isLoading.set(false);

          // Mostrar mensaje de error al usuario
          const errorMessage = error?.error?.message ||
            'Los datos ingresados no son válidos. Por favor verifica el código de barras y el código PUK de tu SIM.';
          this.validationError.set(errorMessage);
        }
      });
    }
  }
}

