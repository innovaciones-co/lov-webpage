import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { Observable, of } from 'rxjs';
import { MsisdnPipe } from '../../../../core/pipes/msisdn.pipe';
import { SubscriptionService } from '../../../../core/services/subscription.service';
import { isLovMsisdnValidator } from '../../../../core/validators/isLovMsisdnValidator';
import { multipleOf1000Validator } from '../../../../core/validators/multipleOf1000Validator';
import { InputNumberComponent } from "../../../../shared/components/form-fields/input-number/input-number";
import { InputTextComponent } from "../../../../shared/components/form-fields/input-text/input-text";
import { LovHeart } from '../../../../shared/components/lov-heart/lov-heart';
import { Product } from '../../../payments/models/product.model';
import { PaymentService } from '../../../payments/services/payment.service';
import { ProductFactoryService } from '../../../payments/services/product-factory.service';

@Component({
  selector: 'app-recharges-intro',
  templateUrl: './recharges-intro.html',
  styleUrl: './recharges-intro.scss',
  imports: [InputTextComponent, ReactiveFormsModule, InputNumberComponent, LovHeart]
})
export class RechargesIntro {

  private paymentsService: PaymentService = inject(PaymentService);
  private productFactoryService: ProductFactoryService = inject(ProductFactoryService);
  private router = inject(Router);
  private subscriptionService = inject(SubscriptionService);
  private msisdnPipe = inject(MsisdnPipe);
  private destroyRef = inject(DestroyRef);


  form = signal(
    new FormGroup({
      msisdn: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
      msisdnConfirmation: new FormControl('', {
        validators: [Validators.required],
        asyncValidators: [this.msisdnConfirmationValidator()]
      }),
      rechargeValue: new FormControl('', [
        Validators.required,
        Validators.min(5000),
        Validators.pattern('^[0-9]+$'),
        multipleOf1000Validator()
      ])
    })
  );

  // One-tap amounts (all valid: at least $5.000 and multiples of $1.000).
  readonly quickAmounts = [5000, 10000, 20000, 30000, 50000];

  private formValue = toSignal(this.form().valueChanges, { initialValue: this.form().value });
  private formStatus = toSignal(this.form().statusChanges, { initialValue: this.form().status });

  selectedAmount = computed(() => Number(this.formValue().rechargeValue) || 0);

  // "Vas a recargar $X a la línea Y", once everything (including the async LOV check) is valid.
  summary = computed(() => this.formStatus() === 'VALID'
    ? { msisdn: this.formValue().msisdn ?? '', amount: this.selectedAmount() }
    : null);

  selectAmount(amount: number): void {
    const control = this.form().controls.rechargeValue;
    control.setValue(String(amount));
    control.markAsDirty();
    control.markAsTouched();
  }

  formatCop(value: number): string {
    return '$' + value.toLocaleString('es-CO');
  }

  constructor() {
    // Re-run msisdnConfirmation's validation whenever msisdn changes, since
    // Angular won't automatically revalidate a sibling control.
    this.form().controls.msisdn.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const confirmationControl = this.form().controls.msisdnConfirmation;
        if (confirmationControl.value) {
          confirmationControl.updateValueAndValidity();
        }
      });
  }

  errorMessages: Record<string, Record<string, string>> = {
    msisdn: {
      pattern: 'El número debe tener 10 dígitos numéricos'
    },
    msisdnConfirmation: {
      mismatch: 'Los números no coinciden',
      isLovMsisdn: 'El número no está asociado a una suscripción LOV'
    },
    rechargeValue: {
      min: 'El valor mínimo de recarga es $5.000',
      pattern: 'El valor debe ser un número válido',
      multipleOf1000: 'El valor debe ser un múltiplo de $1.000'
    }
  };

  /**
   * Combines the match check and the async LOV subscription check into a single
   * async validator. Angular's `setErrors` call when an async validator resolves
   * replaces all of the control's errors, so a separate cross-field validator that
   * sets errors directly on this control would get overwritten once the async
   * validator completes. Keeping both checks in one validator avoids that race.
   */
  private msisdnConfirmationValidator(): AsyncValidatorFn {
    const lovValidator = isLovMsisdnValidator(this.subscriptionService, this.msisdnPipe);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const msisdn = control.parent?.get('msisdn')?.value;
      const msisdnConfirmation = control.value;

      if (msisdn && msisdnConfirmation && msisdn !== msisdnConfirmation) {
        return of({ mismatch: true });
      }

      return lovValidator(control) as Observable<ValidationErrors | null>;
    };
  }

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
      const msisdn = this.form().value.msisdn ?? '';
      const rechargeValue = this.form().value.rechargeValue ?? '';

      const product: Product = this.productFactoryService.createRechargeProduct(msisdn, Number(rechargeValue), Number(rechargeValue));

      this.paymentsService.selectProduct(product);
      await this.router.navigate(['/pagos'], { state: { from: '/recargas', msisdn, rechargeValue } });
      // Example: await this.rechargeService.processRecharge(msisdn, rechargeValue);
    }
    console.log('Form submitted:', this.form().value);
  }
}
