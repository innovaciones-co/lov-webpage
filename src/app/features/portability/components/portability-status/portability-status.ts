import { Component, signal, output, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { ErrorCard } from '../../../../shared/components/error-card/error-card';
import { PortabilityService } from '../../services/portability.service';

export interface PortabilityStatusComponentData {
  lovNumber: string;
}

@Component({
  selector: 'app-portability-status',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextComponent, ErrorCard],
  templateUrl: './portability-status.html',
  styleUrl: './portability-status.scss'
})
export class PortabilityStatusComponent {
  portabilityService = inject(PortabilityService);

  formSubmit = output<PortabilityStatusComponentData>();
  isLoading = signal(false);
  validationError = signal<string>('');

  // Error messages map
  errorMessages: Record<string, Record<string, string>> = {
    lovNumber: {
      pattern: 'El número debe tener 10 dígitos numéricos'
    }
  };

  form = signal(
    new FormGroup({
      lovNumber: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
    })
  );

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
      const { lovNumber } = this.form().value as PortabilityStatusComponentData;
      this.isLoading.set(true);
      this.validationError.set('');

      this.portabilityService.validatePortabilityStatus(lovNumber).subscribe({
        next: (response: any) => {
          console.debug('Portability status response:', response.payload);
          this.isLoading.set(false);
          this.formSubmit.emit(this.form().value as PortabilityStatusComponentData); // TODO: Adjust per response
        },
        error: (error) => {
          console.error('Error validating portability status:', error);
          this.isLoading.set(false);
          const errorMessage = error?.error?.message || 'Error validando el estado de portabilidad. Por favor verifica el número LOV.';
          this.validationError.set(errorMessage);
        }
      });
    }
  }

}
