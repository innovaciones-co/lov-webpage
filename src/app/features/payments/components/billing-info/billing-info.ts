import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubscriptionFacadeService } from '../../../../core/services/subscription-facade.service';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { SelectComponent } from '../../../../shared/components/form-fields/select/select';
import { AuthService } from '../../../authentication/services/auth.service';
import { PaymentService } from '../../services/payment.service';

interface BillingInfoForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  documentType: FormControl<string>;
  documentNumber: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  country: FormControl<string>;
  city: FormControl<string>;
  address: FormControl<string>;
  additionalInfo: FormControl<string>;
}

@Component({
  selector: 'app-billing-info',
  imports: [ReactiveFormsModule, InputTextComponent, SelectComponent],
  templateUrl: './billing-info.html',
  styleUrl: './billing-info.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingInfoComponent {
  billingInfoForm: FormGroup<BillingInfoForm>;

  documentTypes = signal([
    { label: 'Cédula de Ciudadanía', value: 'CC' },
    { label: 'Cédula de Extranjería', value: 'CE' },
    { label: 'Pasaporte', value: 'PP' },
    { label: 'NIT', value: 'NIT' },
    { label: 'Tarjeta de Identidad', value: 'TI' }
  ]);

  countries = signal([
    { label: 'Colombia', value: 'CO' },
    { label: 'Argentina', value: 'AR' },
    { label: 'Brasil', value: 'BR' },
    { label: 'Chile', value: 'CL' },
    { label: 'México', value: 'MX' },
    { label: 'Perú', value: 'PE' },
    { label: 'Venezuela', value: 'VE' },
    { label: 'Ecuador', value: 'EC' },
    { label: 'Uruguay', value: 'UY' },
    { label: 'Paraguay', value: 'PY' }
  ]);

  constructor(private fb: FormBuilder, private paymentService: PaymentService, private authService: AuthService, private subscriptionFacade: SubscriptionFacadeService) {
    this.billingInfoForm = this.fb.group({
      firstName: new FormControl('', { validators: [Validators.required, Validators.minLength(2)], nonNullable: true }),
      lastName: new FormControl('', { validators: [Validators.required, Validators.minLength(2)], nonNullable: true }),
      documentType: new FormControl('', { validators: [Validators.required], nonNullable: true }),
      documentNumber: new FormControl('', { validators: [Validators.required, Validators.pattern(/^[0-9]+$/)], nonNullable: true }),
      email: new FormControl('', { validators: [Validators.required, Validators.email], nonNullable: true }),
      phone: new FormControl('', { validators: [Validators.required, Validators.pattern(/^[+]?[0-9\s-()]+$/)], nonNullable: true }),
      country: new FormControl('', { validators: [Validators.required], nonNullable: true }),
      city: new FormControl('', { validators: [Validators.required, Validators.minLength(2)], nonNullable: true }),
      address: new FormControl('', { validators: [Validators.required, Validators.minLength(5)], nonNullable: true }),
      additionalInfo: new FormControl('', { nonNullable: true })
    });

    const storedMsisdn = this.authService.getStoredMsisdn();
    if (storedMsisdn) {
      this.subscriptionFacade.getCustomerInfo(storedMsisdn).subscribe(customerInfo => {
        if (customerInfo) {
          this.billingInfoForm.patchValue({
            firstName: customerInfo.givenName,
            lastName: customerInfo.familyName,
            documentType: this.fromDocumentTypeValue(customerInfo.document.type),
            documentNumber: customerInfo.document.id,
            email: customerInfo.email,
            country: customerInfo.address.country,
            city: customerInfo.address.city,
            address: customerInfo.address.line1,
            additionalInfo: customerInfo.additionalInformationPlaceHolder.additionalInformationString || '',
            phone: storedMsisdn
          });
        }
      });
    }

    // Register the form with the payment service
    this.paymentService.billingForm.set(this.billingInfoForm);

    // Track form validity changes
    this.billingInfoForm.statusChanges.subscribe(() => {
      this.paymentService.setFormValidityStatus(this.billingInfoForm.valid);
    });

    // Initial validity check
    this.paymentService.setFormValidityStatus(this.billingInfoForm.valid);
  }

  getFieldError(fieldName: string): string {
    const field = this.billingInfoForm.get(fieldName);
    if (field?.touched && field?.errors) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} es requerido`;
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['email']) return 'Ingrese un correo electrónico válido';
      if (field.errors['pattern']) {
        if (fieldName === 'documentNumber') return 'El número de documento solo debe contener números';
        if (fieldName === 'phone') return 'Ingrese un número de teléfono válido';
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'Nombre',
      lastName: 'Apellido',
      documentType: 'Tipo de documento',
      documentNumber: 'Número de documento',
      email: 'Correo electrónico',
      phone: 'Teléfono',
      country: 'País',
      city: 'Ciudad',
      address: 'Dirección'
    };
    return labels[fieldName] || fieldName;
  }

  private fromDocumentTypeValue(value: string): string {
    switch (value) {
      case 'ID':
        return 'CC';
      case 'CC':
        return 'CC';
      case 'CE':
        return 'CE';
      case 'PP':
        return 'PP';
      case 'NIT':
        return 'NIT';
      case 'TI':
        return 'TI';
      default:
        return value;
    }
  }

}

