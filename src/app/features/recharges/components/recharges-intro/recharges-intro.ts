import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { MsisdnPipe } from '../../../../core/pipes/msisdn.pipe';
import { SubscriptionService } from '../../../../core/services/subscription.service';
import { isLovMsisdnValidator } from '../../../../core/validators/isLovMsisdnValidator';
import { multipleOf1000Validator } from '../../../../core/validators/multipleOf1000Validator';
import { InputNumberComponent } from "../../../../shared/components/form-fields/input-number/input-number";
import { InputTextComponent } from "../../../../shared/components/form-fields/input-text/input-text";
import { Product } from '../../../payments/models/product.model';
import { PaymentService } from '../../../payments/services/payment.service';
import { ProductFactoryService } from '../../../payments/services/product-factory.service';

@Component({
  selector: 'app-recharges-intro',
  templateUrl: './recharges-intro.html',
  styleUrl: './recharges-intro.scss',
  imports: [InputTextComponent, ReactiveFormsModule, InputNumberComponent]
})
export class RechargesIntro {

  private paymentsService: PaymentService = inject(PaymentService);
  private productFactoryService: ProductFactoryService = inject(ProductFactoryService);
  private router = inject(Router);
  private subscriptionService = inject(SubscriptionService);
  private msisdnPipe = inject(MsisdnPipe);


  form = signal(
    new FormGroup({
      msisdn: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
      msisdnConfirmation: new FormControl('', {
        asyncValidators: [isLovMsisdnValidator(this.subscriptionService, this.msisdnPipe)]
      }),
      rechargeValue: new FormControl('', [
        Validators.required,
        Validators.min(3000),
        Validators.pattern('^[0-9]+$'),
        multipleOf1000Validator()
      ])
    }, { validators: this.msisdnMatchValidator })
  );

  errorMessages: Record<string, Record<string, string>> = {
    msisdn: {
      pattern: 'El número debe tener 10 dígitos numéricos'
    },
    msisdnConfirmation: {
      mismatch: 'Los números no coinciden',
      isLovMsisdn: 'El número no está asociado a una suscripción LOV'
    },
    rechargeValue: {
      min: 'El valor mínimo de recarga es $3.000',
      pattern: 'El valor debe ser un número válido',
      multipleOf1000: 'El valor debe ser un múltiplo de $1.000'
    }
  };

  msisdnMatchValidator(control: AbstractControl): ValidationErrors | null {
    const msisdn = control.get('msisdn')?.value;
    const msisdnConfirmation = control.get('msisdnConfirmation')?.value;

    if (msisdn && msisdnConfirmation && msisdn !== msisdnConfirmation) {
      control.get('msisdnConfirmation')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    return null;
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
      await this.router.navigate(['/pagos']);
      // Example: await this.rechargeService.processRecharge(msisdn, rechargeValue);
    }
    console.log('Form submitted:', this.form().value);
  }
}
