import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CurrencyPipe } from '../../../../core/pipes/currency.pipe';
import { PaymentService } from '../../services/payment.service';
import { PlanProduct } from '../../models/product.model';

@Component({
  selector: 'app-subscription-summary',
  imports: [CurrencyPipe],
  templateUrl: './subscription-summary.html',
  styleUrl: './subscription-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriptionSummary {
  private static readonly DATE_FORMATTER = new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  private paymentService = inject(PaymentService);

  selectedProduct = this.paymentService.selectedProduct;

  productSummary = computed(() => {
    const product = this.selectedProduct();
    return product ? product.getSummaryView() : null;
  });

  validity = computed(() => {
    const product = this.selectedProduct();
    //if (product?.getProductType() === ProductType.PLAN && product instanceof PlanProduct) { 
    if (product instanceof PlanProduct) {
      return product.plan.validity;
    }

    return null;
  });

  nextRenewalDate = computed(() => {
    const validity = this.validity();
    if (validity === null) {
      return null;
    }

    const renewalDate = new Date();
    renewalDate.setDate(renewalDate.getDate() + validity);
    return SubscriptionSummary.DATE_FORMATTER.format(renewalDate);
  });

  confirmSubscription() {
    // TODO: implement subscription confirmation flow.
  }

}
