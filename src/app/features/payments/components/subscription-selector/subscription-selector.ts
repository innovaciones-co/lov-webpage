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
  set subscriptionTemplate(value: TemplateRef<unknown> | undefined) {
    this.subscriptionTemplateRef.set(value);
  }

  subscriptions = input<CustomerSubscription[]>([]);
  selectedSubscriptionId = input<number | undefined>();
  private readonly paymentService = inject(PaymentService);

  readonly subscriptionControl = new FormControl<string | null>(null);
  readonly subscriptionSelected = output<number>();
  private readonly subscriptionTemplateRef = signal<TemplateRef<unknown> | undefined>(undefined);

  private readonly subscriptionByPhone = computed(() => {
    const phoneIndex = new Map<string, number>();

    for (const subscription of this.subscriptions()) {
      phoneIndex.set(subscription.msisdn.slice(2), subscription.id);
    }

    return phoneIndex;
  });

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

      if (selectedProduct?.getProductType() === ProductType.TOPUP) {
        const matchedSubscriptionId = this.subscriptionByPhone().get(selectedProduct.id);
        if (
          matchedSubscriptionId !== undefined
          && this.selectedSubscriptionId() !== matchedSubscriptionId
        ) {
          this.subscriptionSelected.emit(matchedSubscriptionId);
        }
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
    if (selectedProduct?.getProductType() === ProductType.TOPUP) {
      const msisdn = this.subscriptions().find((subscription) => subscription.id === parsedSubscriptionId)?.msisdn;
      const nextProductId = msisdn ? msisdn.slice(2) : selectedProduct.id;

      if (nextProductId !== selectedProduct.id) {
        this.paymentService.selectedProduct.set(
          new RechargeProduct(
            nextProductId,
            selectedProduct.name,
            selectedProduct.description,
            selectedProduct.basePrice,
            selectedProduct.totalPrice,
            selectedProduct.totalTax,
            selectedProduct.imageUrl,
            selectedProduct.productType
          )
        );
      }
    }

    this.subscriptionSelected.emit(parsedSubscriptionId);
  }
}
