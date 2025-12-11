import { Component, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { Modal } from "../../../../shared/components/modal/modal";
import { PortabilityService } from '../../services/portability.service';

export interface PortabilityInformationData {
  lovNumber: string;
  iccidDigits: string;
}

@Component({
  selector: 'app-portability-information-form',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextComponent, Modal],
  templateUrl: './portability-information-form.component.html',
  styleUrl: './portability-information-form.component.scss'
})
export class PortabilityInformation {
  private portabilityService = inject(PortabilityService);

  formSubmit = output<PortabilityInformationData>();
  simInvalidModalOpen = signal(false);

  // Error messages map
  errorMessages: Record<string, Record<string, string>> = {
    lovNumber: {
      pattern: 'El número debe tener 10 dígitos numéricos'
    },
    iccidDigits: {
      pattern: 'El campo debe tener 5 dígitos numéricos'
    }
  };

  form = signal(
    new FormGroup({
      lovNumber: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
      iccidDigits: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{5}$')]),
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

  async onSubmit(): Promise<void> {
    if (this.form().valid) {
      const lovNumber = this.form().value.lovNumber ?? '';
      const iccidDigits = this.form().value.iccidDigits ?? '';
      const isValid = await this.portabilityService.validateSimCard(lovNumber, iccidDigits);

      if (!isValid) {
        this.simInvalidModalOpen.set(true);
        return;
      }

      this.formSubmit.emit(this.form().value as PortabilityInformationData);
    }
    console.log('Form submitted:', this.form().value);
  }

  onCancelModal(): void {
    this.simInvalidModalOpen.set(false);
  }

  onContinueModal(): void {
    this.simInvalidModalOpen.set(false);
  }

}
