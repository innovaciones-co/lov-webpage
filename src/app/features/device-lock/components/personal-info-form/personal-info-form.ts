import { Component, inject, output, signal, OnInit, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { SelectComponent } from '../../../../shared/components/form-fields/select/select';
import { Router } from '@angular/router';
import { DeviceLockService } from '../../services/device-lock.service';
import { ErrorCard } from "../../../../shared/components/error-card/error-card";

export interface PersonalInfoFormData {
  name: string;
  lastName: string;
  documentType: string;
  documentID: string;
  email: string;
  phoneNumber: string;
  city: string;
  address: string;
  addressOptional: string;
  imei: string;
}

@Component({
  selector: 'app-personal-info-form',
  imports: [ReactiveFormsModule,
    InputTextComponent,
    SelectComponent, ErrorCard],
  templateUrl: './personal-info-form.html',
  styleUrl: './personal-info-form.scss'
})
export class PersonalInfoForm implements OnInit {
  private router = inject(Router);
  private deviceLockService = inject(DeviceLockService);

  subscriberData = input<any>(null);

  imeiList = signal<{ label: string; value: string }[]>([]);
  validationError = signal<string>('');

  ngOnInit(): void {
    this.form().get('documentID')?.valueChanges.subscribe(() => {
      this.onDocumentIDChange();
    });
  }

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
      email: new FormControl('', [Validators.required, Validators.email]),
      phoneNumber: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
      city: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      addressOptional: new FormControl(''),
      imei: new FormControl('', Validators.required),
    })
  );

  documentType = signal([
    { label: 'Cédula', value: 'ID' },
    { label: 'Cédula de extranjeria', value: 'foreignID' },
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

  onSubmit(): void {
    if (this.form().valid) {
      this.formSubmit.emit(this.form().value as PersonalInfoFormData);
    }
  }

  private async onDocumentIDChange(): Promise<void> {
    const documentIdFromForm = this.form().get('documentID')?.value;
    if (!documentIdFromForm) {
      this.imeiList.set([]);
      return;
    }

    const subscriptionId = this.subscriberData()?.subscriptions?.[0]?.id;
    const documentId = this.subscriberData()?.document?.id;

    // Limpiar error previo
    this.validationError.set('');

    if (!subscriptionId || !documentId || documentIdFromForm !== documentId) {
      this.imeiList.set([]);
      return;
    }

    try {
      const imeiList = await this.deviceLockService.getImeiList(subscriptionId);
      this.imeiList.set(imeiList);

      if (imeiList.length === 0) {
        this.validationError.set('Lo sentimos, no se encontraron dispositivos asociados a tu número LOV. Por favor, contacta al equipo de soporte para más información.');
      }
    } catch {
      this.imeiList.set([]);
    }
  }
}
