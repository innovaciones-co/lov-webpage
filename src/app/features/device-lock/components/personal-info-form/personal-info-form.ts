import { Component, inject, output, signal, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { SelectComponent } from '../../../../shared/components/form-fields/select/select';
import { Router } from '@angular/router';
import { DeviceLockService } from '../../services/device-lock.service';
import { ErrorCard } from "../../../../shared/components/error-card/error-card";
import { CheckboxComponent } from "../../../../shared/components/form-fields/checkbox/checkbox";

export interface PersonalInfoFormData {
  email: string;
  phoneNumber: string;
  city: string;
  address: string;
  addressOptional: string;
  imei: string;
  terms: boolean;
}

@Component({
  selector: 'app-personal-info-form',
  imports: [ReactiveFormsModule,
    InputTextComponent,
    SelectComponent, ErrorCard, CheckboxComponent],
  templateUrl: './personal-info-form.html',
  styleUrl: './personal-info-form.scss'
})
export class PersonalInfoForm {
  private router = inject(Router);
  private deviceLockService = inject(DeviceLockService);

  subscriptionId = input.required<string>();
  incidentInfo = input.required<any>();
  imeiList = input<{ label: string; value: string }[]>([]);
  validationError = signal<string>('');
  isLoading = signal(false);

  // Error messages map (only specific validations, required is automatic)
  errorMessages: Record<string, Record<string, string>> = {
    email: {
      email: 'Ingrese un email válido'
    },
    phoneNumber: {
      pattern: 'El teléfono debe tener 10 dígitos numéricos'
    }
  };

  form = signal(
    new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      phoneNumber: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
      city: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      addressOptional: new FormControl(''),
      imei: new FormControl('', Validators.required),
      terms: new FormControl(false, Validators.requiredTrue),
    })
  );

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

  onSubmit(): void {
    if (this.form().valid) {
      this.isLoading.set(true);
      this.validationError.set('');

      const payload = this.buildLockDevicePayload();

      this.deviceLockService.lockDevice(this.subscriptionId(), payload)
        .then(() => {
          this.formSubmit.emit(this.form().value as PersonalInfoFormData);
          console.log('Device locked successfully');
          // TODO: Redirect to success page or show success message
        })
        .catch((error) => {
          console.error('Error locking device:', error);
          this.validationError.set('Error al bloquear el dispositivo. Por favor, intenta nuevamente.');
        })
        .finally(() => {
          this.isLoading.set(false);
        });
    }
  }

  private buildLockDevicePayload(): any {
    const personalInfo = this.form().value as PersonalInfoFormData;
    const incidentInfo = this.incidentInfo();

    return {
      eventDate: new Date().toISOString(),
      habeasData: personalInfo.terms,
      imei: personalInfo.imei,
      reportDate: new Date(`${incidentInfo.incidentDate}T00:00:00.000Z`).toISOString(),
      reportType: incidentInfo.blockType,
      reporter: {
        address: personalInfo.address,
        city: personalInfo.city,
        name: `${incidentInfo.name} ${incidentInfo.lastName}`,
        phone: personalInfo.phoneNumber,
        state: personalInfo.addressOptional
      },
      reporterDocument: {
        id: incidentInfo.documentID,
        type: incidentInfo.documentType
      },
      victimEmail: personalInfo.email,
      victimMinor: incidentInfo.isMinor,
      violenceApplied: incidentInfo.violenceApplied,
      weaponApplied: incidentInfo.weaponType
    };
  }
}
