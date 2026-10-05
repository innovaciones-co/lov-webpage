import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
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
import { PaymentService } from '../services/payment-service';

// Loaded via <script> in index.html (OnePay's "Elements" card-capture SDK) — no npm types available.
declare const FTCaptures: any;

// The fixed Captures "service" identifier FTCaptures.init()/validate()/tokenize() expect
// as their first argument — NOT our pk_test_/pk_live_ API key (confirmed with OnePay
// support: the two are different credentials and aren't interchangeable; passing the API
// key here makes the service reject the call, which the SDK reports as a generic
// "Network error." that looked like a CORS/domain issue but wasn't). Per OnePay's docs
// this identifier is the same for every integrator and every environment.
const CAPTURES_SERVICE_ID = 'ggMoeO2K3G';

type CardField = 'holder' | 'number' | 'expiration' | 'cvv';
type FieldStatusMap = Record<CardField, 'idle' | 'valid' | 'invalid'>;

@Component({
  selector: 'app-create-payment-method',
  imports: [ReactiveFormsModule, InputTextComponent, SelectComponent, ErrorCard],
  templateUrl: './create-payment-method.html',
  styleUrl: './create-payment-method.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePaymentMethod implements AfterViewInit, OnDestroy {
  private readonly paymentService = inject(PaymentService);
  private ft: any;
  private destroyed = false;
  private containerObserver: MutationObserver | null = null;

  readonly customerId = input.required<string>();
  // Shown when this form is used inline during a plan purchase with "Suscripción
  // recurrente" — lets the customer opt into automatic plan renewal for the new card.
  readonly showAutoRenewOption = input(false);
  readonly paymentMethodCreated = output<number>();
  readonly isLoading = signal(false);
  readonly submitError = signal('');
  readonly sdkReady = signal(false);
  readonly fieldStatus = signal<FieldStatusMap>({
    holder: 'idle',
    number: 'idle',
    expiration: 'idle',
    cvv: 'idle',
  });

  readonly documentTypes = signal([
    { label: 'Cédula de ciudadanía', value: 'CC' },
    { label: 'Cédula de extranjería', value: 'CE' },
    { label: 'NIT', value: 'NIT' },
    { label: 'Pasaporte', value: 'PASSPORT' },
  ]);

  readonly errorMessages: Record<string, Record<string, string>> = {
    fullName: {
      minlength: 'Ingresa el nombre completo del titular.',
    },
    email: {
      email: 'Ingresa un correo válido.',
    },
    phone: {
      pattern: 'Ingresa un número de celular válido (ej. +573001234567).',
    },
    documentNumber: {
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
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      phone: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^\+?[0-9]{10,13}$/)],
      }),
      documentType: new FormControl('CC', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      documentNumber: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.pattern(/^[0-9]+$/),
          Validators.minLength(4),
          Validators.maxLength(20),
        ],
      }),
    })
  );

  ngAfterViewInit(): void {
    this.initOnePayElements();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.containerObserver?.disconnect();
    this.containerObserver = null;
  }

  private initOnePayElements(): void {
    if (typeof FTCaptures === 'undefined') {
      console.error('OnePay Elements SDK (FTCaptures) not loaded');
      this.submitError.set('No se pudo cargar el módulo de pago seguro. Recarga la página e intenta de nuevo.');
      return;
    }

    const ft = FTCaptures.init(CAPTURES_SERVICE_ID, 'production', () => {
      // FTCaptures may invoke this callback synchronously, before the `const ft = ...`
      // assignment below has finished — defer to the next microtask so `ft` (captured
      // by closure) is guaranteed to be assigned by the time we use it. The callback can
      // also fire genuinely late (real network round-trip inside the SDK), possibly after
      // this component/modal instance has already been torn down — mountOnePayFields
      // guards against both the container not existing yet and the component being gone.
      queueMicrotask(() => this.mountOnePayFields(ft));
    });
    this.ft = ft;
  }

  private mountOnePayFields(ft: any): void {
    if (this.destroyed) {
      return;
    }

    if (!document.getElementById('cc-holder')) {
      // This component is projected into <app-modal>, which keeps its content out of the
      // DOM (behind its own @if) until it's actually opened. ngAfterViewInit fires as soon
      // as this component is created — which can be well before the modal opens for the
      // first time — so the container may not exist yet. Wait for it to be attached instead
      // of giving up: there's no fixed time budget we can assume here.
      if (!this.containerObserver) {
        this.containerObserver = new MutationObserver(() => {
          if (this.destroyed) {
            this.containerObserver?.disconnect();
            return;
          }
          if (document.getElementById('cc-holder')) {
            this.containerObserver?.disconnect();
            this.containerObserver = null;
            this.mountOnePayFields(ft);
          }
        });
        this.containerObserver.observe(document.body, { childList: true, subtree: true });
      }
      return;
    }

    // The visible border/focus/validity ring now lives on the `.onepay-input` wrapper
    // (our own DOM), so the iframe itself is styled borderless and flush to sit inside it.
    const css = {
      color: '#1a1a2e',
      height: '46px',
      'font-size': '15px',
      padding: '0 4px',
      border: 'none',
      background: 'transparent',
    };

    // `name` is required — it's the key each iframe reports its value under in the
    // "dataReady" message the SDK collects before tokenizing (confirmed by reading the
    // SDK source: without it, every field reports under the same blank key and clobbers
    // the others, so tokenize() ends up sending an empty body).
    ft.field('#cc-holder', { type: 'card-holder', name: 'holder', autocomplete: 'cc-holder', placeholder: 'Nombre en la tarjeta', required: 'true', css });
    ft.field('#cc-number', { type: 'card-number', name: 'number', autocomplete: 'cc-number', placeholder: 'Número de tarjeta', required: 'true', css });
    ft.field('#cc-expiration-date', { type: 'card-expiration-date', name: 'expiration_date', autocomplete: 'cc-expiration-date', placeholder: 'MM/AA', required: 'true', css });
    ft.field('#cc-cvv', { type: 'card-security-code', name: 'cvv', autocomplete: 'cc-csc', placeholder: 'CVV', required: 'true', css });

    this.registerFieldValidationEvents(ft);
    this.sdkReady.set(true);
  }

  private registerFieldValidationEvents(ft: any): void {
    const bind = (field: CardField, successEvent: string, failedEvent: string) => {
      ft.on(successEvent, () => this.setFieldStatus(field, 'valid'));
      ft.on(failedEvent, () => this.setFieldStatus(field, 'invalid'));
    };

    bind('holder', 'cardHolderValidationSuccess', 'cardHolderValidationFailed');
    bind('number', 'cardNumberValidationSuccess', 'cardNumberValidationFailed');
    bind('expiration', 'cardExpirationDateValidationSuccess', 'cardExpirationDateValidationFailed');
    bind('cvv', 'cardSecurityCodeValidationSuccess', 'cardSecurityCodeValidationFailed');
  }

  private setFieldStatus(field: CardField, status: FieldStatusMap[CardField]): void {
    this.fieldStatus.update((current) => ({ ...current, [field]: status }));
  }

  getFieldErrorMessage(fieldName: string): string {
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

  async onSubmit(): Promise<void> {
    if (this.form().invalid || !this.sdkReady()) {
      this.form().markAllAsTouched();
      return;
    }

    // OnePay's own FTCaptures.validate() has a bug in its resolution check (confirmed by
    // reading its source: it compares the number of field responses received against a
    // shared/global iFrames count that doesn't reliably match the current form's fields,
    // so the returned promise can hang forever). We already track per-field validity
    // ourselves via the cardXValidationSuccess/Failed events (see fieldStatus), so use
    // that instead of calling validate().
    const status = this.fieldStatus();
    if (status.holder === 'invalid' || status.number === 'invalid' || status.expiration === 'invalid' || status.cvv === 'invalid') {
      this.submitError.set('Revisa los datos de la tarjeta e intenta de nuevo.');
      return;
    }

    this.isLoading.set(true);
    this.submitError.set('');

    try {
      // Tokenizes the raw card data client-side. It never reaches our backend — only the
      // resulting temporary cardToken does.
      const tokenization = await FTCaptures.tokenize(CAPTURES_SERVICE_ID);
      const cardToken = tokenization?.number;

      if (!cardToken) {
        this.submitError.set('No se pudo procesar la tarjeta. Intenta de nuevo.');
        this.isLoading.set(false);
        return;
      }

      const { fullName, email, phone, documentType, documentNumber } = this.form().getRawValue();
      const [firstName, ...rest] = fullName.trim().split(/\s+/);
      const lastName = rest.join(' ') || firstName;

      this.paymentService
        .createOnePayPaymentMethod({
          cardToken,
          firstName,
          lastName,
          email: email.trim(),
          phone: phone.trim(),
          documentType,
          documentNumber: documentNumber.trim(),
        })
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: (newPaymentMethodId) => {
            console.debug('OnePay payment method created successfully:', newPaymentMethodId);
            this.form().reset({ documentType: 'CC' });
            this.fieldStatus.set({ holder: 'idle', number: 'idle', expiration: 'idle', cvv: 'idle' });
            this.paymentMethodCreated.emit(newPaymentMethodId);
          },
          error: (error) => {
            console.error('Error creating OnePay payment method:', error);
            this.submitError.set('No se pudo añadir la tarjeta. Verifica los datos e intenta de nuevo.');
          },
        });
    } catch (error) {
      console.error('Error tokenizing card with OnePay:', error);
      this.submitError.set('No se pudo procesar la tarjeta. Verifica los datos e intenta de nuevo.');
      this.isLoading.set(false);
    }
  }
}
