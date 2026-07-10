import { Component, ViewChild, TemplateRef, AfterViewInit, signal, input, inject, computed, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RadioComponent } from '../../../../shared/components/form-fields/radio/radio';
import { CustomerSubscription } from '../../../../core/models/customer.model';
import { SubscriptionFacadeService } from '../../../../core/services/subscription-facade.service';

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

  currentSubscription = input<CustomerSubscription | undefined>();
  private subscriptionFacade = inject(SubscriptionFacadeService);

  readonly paymentMethodControl = new FormControl<string | null>(null);
  accounts = signal<any[]>([]);

  disclaimerTitle = signal<string>('');
  disclaimerContent = signal<string>('');

  selectedPaymentMethod = toSignal(this.paymentMethodControl.valueChanges, { initialValue: null });

  pesoBalance = computed(() => {
    const currencyAccount = this.accounts().find(account => account.name === 'Pesos');
    if (!currencyAccount || !currencyAccount.unit?.relation) {
      return '-';
    }
    const adjustedBalance = currencyAccount.balance / currencyAccount.unit.relation;
    return adjustedBalance.toString();
  });

  paymentMethods = signal<any[]>([
    { value: 'recurring', template: this.recurringTemplate },
    { value: 'balance', template: this.balanceTemplate },
    { value: 'payu', template: this.payuTemplate }
  ]);

  constructor() {
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
      if (selectedMethod === 'recurring') {
        this.disclaimerTitle.set('Este método pagará tu suscripción recurrente');
        this.disclaimerContent.set('Próximo cobro: 14 de junio de 2026 por $49,900'); // TODO: Replace with dynamic date and amount
      } else if (selectedMethod === 'balance') {
        this.disclaimerTitle.set('Saldo insuficiente');
        this.disclaimerContent.set('El saldo disponible es insuficiente para cubrir el costo del plan. Al continuar, se realizará un cobro adicional.');
      } else {
        this.disclaimerTitle.set('');
        this.disclaimerContent.set('');
      }
    });
  }

  ngAfterViewInit(): void {
    this.paymentMethods.set([
      { value: 'recurring', template: this.recurringTemplate },
      { value: 'balance', template: this.balanceTemplate },
      { value: 'payu', template: this.payuTemplate }
    ]);
  }
}
