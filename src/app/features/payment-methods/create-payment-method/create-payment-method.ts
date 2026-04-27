import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { ErrorCard } from '../../../shared/components/error-card/error-card';
import { InputTextComponent } from '../../../shared/components/form-fields/input-text/input-text';
import { SelectComponent } from '../../../shared/components/form-fields/select/select';
import {
  PaymentCardData,
  PaymentService,
} from '../services/payment-service';

interface PaymentMethodFormData {
  fullName: string;
  cardNumber: string;
  expirationMonth: string;
  expirationYear: string;
  cvv: string;
  payerId: string;
}

@Component({
  selector: 'app-create-payment-method',
  imports: [ReactiveFormsModule, InputTextComponent, SelectComponent, ErrorCard],
  templateUrl: './create-payment-method.html',
  styleUrl: './create-payment-method.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePaymentMethod {
  private readonly paymentService = inject(PaymentService);

  readonly customerId = input.required<string>();
  readonly paymentMethodCreated = output<void>();
  readonly isLoading = signal(false);
  readonly submitError = signal('');
  readonly brand = signal('');

  readonly expirationMonths = signal(
    Array.from({ length: 12 }, (_, index) => {
      const month = String(index + 1).padStart(2, '0');
      return { label: month, value: month };
    })
  );

  readonly expirationYears = signal(
    Array.from({ length: 15 }, (_, index) => {
      const year = String(new Date().getFullYear() + index);
      return { label: year, value: year };
    })
  );

  readonly errorMessages: Record<string, Record<string, string>> = {
    fullName: {
      minlength: 'Ingresa el nombre completo del titular.',
    },
    cardNumber: {
      pattern: 'Ingresa un número de tarjeta válido.',
      minlength: 'La tarjeta debe tener entre 13 y 19 dígitos.',
      maxlength: 'La tarjeta debe tener entre 13 y 19 dígitos.',
    },
    expirationMonth: {
      required: 'Selecciona el mes de expiración.',
    },
    expirationYear: {
      required: 'Selecciona el año de expiración.',
    },
    cvv: {
      pattern: 'El código de seguridad debe tener 3 o 4 dígitos.',
    },
    payerId: {
      pattern: 'El documento solo debe contener números.',
      minlength: 'El documento debe tener entre 4 y 20 dígitos.',
      maxlength: 'El documento debe tener entre 4 y 20 dígitos.',
    },
  };

  readonly form = signal(
    new FormGroup({
      fullName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3)],
      }),
      cardNumber: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(13),
          Validators.maxLength(23),
          Validators.pattern(/^[\d ]+$/),
        ],
      }),
      expirationMonth: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      expirationYear: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      cvv: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)],
      }),
      payerId: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.minLength(4), Validators.maxLength(20)],
      }),
    })
  );

  constructor() {
    this.form()
      .controls.cardNumber.valueChanges.pipe(takeUntilDestroyed())
      .subscribe((value) => {
        const rawValue = value ?? '';
        const digitsOnly = rawValue.replace(/\D/g, '').slice(0, 19);
        const formattedValue = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ').trim();

        if (formattedValue !== rawValue) {
          this.form().controls.cardNumber.setValue(formattedValue, { emitEvent: false });
        }

        const detectedBrand = digitsOnly ? this.paymentService.getCardType(digitsOnly) : '';
        this.brand.set(detectedBrand === 'UNKNOWN' ? '' : detectedBrand);
      });
  }

  getFieldErrorMessage(fieldName: keyof PaymentMethodFormData): string {
    const control = this.form().get(fieldName);

    if (!control?.errors || !control.touched) {
      return '';
    }

    const firstError = Object.keys(control.errors)[0];

    if (firstError === 'required') {
      return 'Este campo es obligatorio';
    }

    return this.errorMessages[fieldName]?.[firstError] || 'Error de validación';
  }

  onSubmit(): void {
    if (this.form().invalid) {
      this.form().markAllAsTouched();
      return;
    }

    const { fullName, cardNumber, expirationMonth, expirationYear, payerId, cvv } =
      this.form().getRawValue();

    if (!this.paymentService.validateExpiry(expirationMonth, expirationYear)) {
      this.submitError.set('La fecha de expiración de la tarjeta no es válida.');
      return;
    }

    const cardData: PaymentCardData = {
      payerId: this.customerId(),
      name: fullName.trim(),
      identificationNumber: payerId.trim(),
      creditCardNumber: cardNumber.replace(/\s/g, ''),
      creditCardSecurityCode: Number(cvv.trim()),
      creditCardExpirationMonth: Number(expirationMonth),
      creditCardExpirationYear: Number(expirationYear),
      paymentMethod: this.brand(),
    };

    this.isLoading.set(true);
    this.submitError.set('');

    this.paymentService.createPaymentMethod(cardData).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response) => {
        console.debug('Payment method created successfully:', response);
        this.form().reset();
        this.paymentMethodCreated.emit();
      },
      error: (error) => {
        console.error('Error creating payment method:', error);
        const errorMessage = error?.error?.message || 'Error al crear el método de pago. Por favor, intenta de nuevo más tarde.';
        this.submitError.set(errorMessage);
      }
    });
  }
}
