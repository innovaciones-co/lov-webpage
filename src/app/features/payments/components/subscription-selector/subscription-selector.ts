import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, output } from '@angular/core';
import { CustomerSubscription } from '../../../../core/models/customer.model';
import { LineAliasService } from '../../../../core/services/line-alias.service';
import { ProductType, RechargeProduct } from '../../models/product.model';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-subscription-selector',
  imports: [CommonModule],
  templateUrl: './subscription-selector.html',
  styleUrl: './subscription-selector.scss'
})
export class SubscriptionSelector {
  subscriptions = input<CustomerSubscription[]>([]);
  selectedSubscriptionId = input<number | undefined>();
  private readonly paymentService = inject(PaymentService);

  // Same names and colors the customer gave their lines in Mi cuenta.
  readonly lines = inject(LineAliasService);
  readonly subscriptionSelected = output<number>();

  private readonly subscriptionByPhone = computed(() => {
    const phoneIndex = new Map<string, number>();

    for (const subscription of this.subscriptions()) {
      phoneIndex.set(subscription.msisdn.slice(2), subscription.id);
    }

    return phoneIndex;
  });

  constructor() {
    this.lines.load();

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
