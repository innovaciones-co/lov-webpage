import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CustomerSubscription } from '../../../../core/models/customer.model';
import { RadioComponent } from '../../../../shared/components/form-fields/radio/radio';
import { ProductType, RechargeProduct } from '../../models/product.model';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-subscription-selector',
  imports: [ReactiveFormsModule, CommonModule, RadioComponent],
  templateUrl: './subscription-selector.html',
  styleUrl: './subscription-selector.scss'
})
export class SubscriptionSelector {
  @ViewChild('subscriptionTemplate')
  set subscriptionTemplate(value: TemplateRef<any> | undefined) {
    this.subscriptionTemplateRef.set(value);
  }

  subscriptions = input<CustomerSubscription[]>([]);
  selectedSubscriptionId = input<number | undefined>();
  paymentService = inject(PaymentService);

  readonly subscriptionControl = new FormControl<string | null>(null);
  readonly subscriptionSelected = output<number>();
  private readonly subscriptionTemplateRef = signal<TemplateRef<any> | undefined>(undefined);

  readonly subscriptionOptions = computed(() => {
    const template = this.subscriptionTemplateRef();

    return this.subscriptions().map((subscription) => ({
      value: subscription.id.toString(),
      template,
      phone: subscription.msisdn.slice(2, undefined),
    }));
  });

  constructor() {
    effect(() => {
      const selectedProduct = this.paymentService.selectedProduct();

      if (selectedProduct?.getProductType() == ProductType.TOPUP) {
        this.subscriptions().forEach((subscription) => {
          if (subscription.msisdn.includes(selectedProduct.id)) {
            const parsedSubscriptionId = Number(subscription.id);
            if (Number.isNaN(parsedSubscriptionId)) {
              return;
            }

            this.subscriptionSelected.emit(parsedSubscriptionId);
          }
        });
      }
    });

    effect(() => {
      const selectedId = this.selectedSubscriptionId();
      const formattedSelectedId = selectedId !== undefined ? selectedId.toString() : null;

      if (this.subscriptionControl.value !== formattedSelectedId) {
        this.subscriptionControl.setValue(formattedSelectedId, { emitEvent: false });
      }
    });
  }

  onSubscriptionChange(selectedSubscriptionId: string): void {
    const parsedSubscriptionId = Number(selectedSubscriptionId);
    if (Number.isNaN(parsedSubscriptionId)) {
      return;
    }

    const selectedProduct = this.paymentService.selectedProduct();
    if (selectedProduct?.getProductType() == ProductType.TOPUP) {
      const msisdn = this.subscriptions().find((subscription) => subscription.id === parsedSubscriptionId)?.msisdn;
      selectedProduct.id = msisdn ? msisdn.slice(2, undefined) : selectedProduct.id;

      this.paymentService.selectedProduct.set(new RechargeProduct(selectedProduct.id, selectedProduct.name, selectedProduct.description, selectedProduct.basePrice, selectedProduct.totalPrice, selectedProduct.totalTax, selectedProduct.imageUrl));
    }

    this.subscriptionSelected.emit(parsedSubscriptionId);
  }
}
