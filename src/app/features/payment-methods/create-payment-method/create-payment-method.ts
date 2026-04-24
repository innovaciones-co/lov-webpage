import {
  ChangeDetectionStrategy,
  Component,
  inject,
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
  CardTokenData,
  PaymentService,
  PaymentTokenResponse,
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
  readonly tokenGenerated = output<string>();

  readonly isLoading = signal(false);
  readonly submitError = signal('');
  readonly generatedToken = signal('');
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
      pattern: 'El identificador del pagador solo debe contener números.',
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
        validators: [Validators.required, Validators.pattern(/^[0-9]+$/)],
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

    const cardData: CardTokenData = {
      number: cardNumber.replace(/\s/g, ''),
      exp_month: expirationMonth,
      exp_year: expirationYear,
      name_card: fullName.trim(),
      payer_id: payerId.trim(),
      cvv: cvv.trim(),
    };

    this.isLoading.set(true);
    this.submitError.set('');
    this.generatedToken.set('');

    this.paymentService
      .createToken(cardData)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response: PaymentTokenResponse) => {
          const token =
            response.creditCardToken?.creditCardTokenId ??
            response.creditCardToken?.token ??
            response.id ??
            response.token ??
            '';

          if (!token) {
            this.submitError.set('No fue posible obtener el token de la tarjeta.');
            return;
          }

          this.generatedToken.set(token);
          this.tokenGenerated.emit(token);
          this.form().controls.cvv.reset('');
        },
        error: (error: unknown) => {
          this.submitError.set(this.getSubmitErrorMessage(error));
        },
      });
  }

  private getSubmitErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'object' && error !== null) {
      const errorData = error as {
        description?: string;
        error?: string;
        message?: string;
      };

      return (
        errorData.description ||
        errorData.error ||
        errorData.message ||
        'No fue posible generar el token de pago.'
      );
    }

    return 'No fue posible generar el token de pago.';
  }
}
