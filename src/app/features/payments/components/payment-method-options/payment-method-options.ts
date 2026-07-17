import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, effect, inject, input, signal, TemplateRef, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CustomerSubscription } from '../../../../core/models/customer.model';
import { CurrencyPipe } from '../../../../core/pipes/currency.pipe';
import { SubscriptionFacadeService } from '../../../../core/services/subscription-facade.service';
import { RadioComponent } from '../../../../shared/components/form-fields/radio/radio';
import PaymentMethod from '../../models/payment-method.model';
import { ProductType } from '../../models/product.model';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-payment-method-options',
  imports: [RadioComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './payment-method-options.html',
  styleUrl: './payment-method-options.scss'
})
export class PaymentMethodOptions implements AfterViewInit {
  @ViewChild('recurringTemplate') recurringTemplate?: TemplateRef<any>;
  @ViewChild('balanceTemplate') balanceTemplate?: TemplateRef<any>;
  @ViewChild('payuTemplate') payuTemplate?: TemplateRef<any>;
  private viewInitialized = signal(false);

  currentSubscription = input<CustomerSubscription | undefined>();
  private subscriptionFacade = inject(SubscriptionFacadeService);
  private allowedPaymentMethods: any[] = [];

  readonly paymentMethodControl = new FormControl<string | null>(null);
  accounts = signal<any[]>([]);
  private remainingPayment = signal<number>(0);

  disclaimerTitle = signal<string>('');
  disclaimerContent = signal<string>('');

  selectedPaymentMethod = toSignal(this.paymentMethodControl.valueChanges, { initialValue: null });

  pesoBalance = computed(() => {
    const currencyAccount = this.accounts().find(account => account.name === 'Pesos');
    if (!currencyAccount || !currencyAccount.unit?.relation) {
      return 0;
    }
    const adjustedBalance = currencyAccount.balance / currencyAccount.unit.relation;
    return adjustedBalance;
  });

  paymentMethods = signal<any[]>([
    { value: PaymentMethod.CARD, template: this.recurringTemplate },
    { value: PaymentMethod.BALANCE, template: this.balanceTemplate },
    { value: PaymentMethod.WEB_CHECKOUT, template: this.payuTemplate }
  ]);

  constructor(
    private paymentService: PaymentService
  ) {

    effect(() => {
      const product = this.paymentService.selectedProduct();
      if (product) {
        const balance = this.pesoBalance();
        this.remainingPayment.set(product.totalPrice - balance);
      }
    });

    effect(() => {
      const subscription = this.currentSubscription();
      if (subscription) {
        this.subscriptionFacade.getAccountsForSubscription(
          subscription.customerId,
          subscription.id.toString()
        ).subscribe(accounts => {
          //console.log('📊 Accounts completa:', accounts[0].balance);
          this.accounts.set(accounts);
        });
      }
    });

    effect(() => {
      const selectedMethod = this.selectedPaymentMethod();
      this.paymentService.paymentMethod.set(selectedMethod as PaymentMethod | undefined);

      if (selectedMethod === PaymentMethod.CARD) {
        this.disclaimerTitle.set('Este método pagará tu suscripción recurrente');
        this.disclaimerContent.set('Próximo cobro: 14 de junio de 2026 por $49,900'); // TODO: Replace with dynamic date and amount
      } else if (selectedMethod === PaymentMethod.BALANCE) {
        if (this.remainingPayment() > 0) {
          this.disclaimerTitle.set('Saldo parcial');
          this.disclaimerContent.set(`Tu saldo ${new CurrencyPipe().transform(this.pesoBalance())} cubrirá parte del pago. El resto (${new CurrencyPipe().transform(this.remainingPayment())}) se cobrará por a través de Pay U.`);
        } else {
          this.disclaimerTitle.set('Pago completo con saldo');
          this.disclaimerContent.set(`Tu saldo ${new CurrencyPipe().transform(this.pesoBalance())} cubrirá el pago completo.`);
        }
      } else {
        this.disclaimerTitle.set('');
        this.disclaimerContent.set('');
      }
    });

    effect(() => {
      if (this.viewInitialized() && this.paymentService.selectedProduct()) {
        this.refreshAllowedPaymentMethods();
      }
    });
  }

  ngAfterViewInit(): void {
    this.viewInitialized.set(true);
    this.refreshAllowedPaymentMethods();
  }

  refreshAllowedPaymentMethods() {
    const product = this.paymentService.selectedProduct();

    if (!product) {
      this.allowedPaymentMethods = [];
      this.paymentMethods.set(this.allowedPaymentMethods);
      return;
    }

    this.allowedPaymentMethods = [
      { value: PaymentMethod.WEB_CHECKOUT, template: this.payuTemplate }
    ];

    switch (product!.productType) {
      case ProductType.BUNDLE:
        if (this.pesoBalance() > 0) {
          this.allowedPaymentMethods.push({ value: PaymentMethod.BALANCE, template: this.balanceTemplate });
        }
        break;
      case ProductType.PLAN:
        if (this.pesoBalance() > 0) {
          this.allowedPaymentMethods.push({ value: PaymentMethod.BALANCE, template: this.balanceTemplate });
        }
        this.allowedPaymentMethods.push({ value: PaymentMethod.CARD, template: this.recurringTemplate });
        break;

    }

    this.paymentMethods.set(this.allowedPaymentMethods);

  }

}
