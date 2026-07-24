import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ProductType } from '../../models/product.model';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-summary',
  imports: [],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Summary {
  private paymentService = inject(PaymentService);

  selectedProduct = this.paymentService.selectedProduct;

  productSummary = computed(() => {
    const product = this.selectedProduct();
    return product ? product.getSummaryView() : null;
  });

  // Expose ProductType enum to template
  ProductType = ProductType;

  getMaterialSymbol(measure?: string): string {
    const symbolMap: Record<string, string> = {
      GB: 'mail',
      MB: 'mail',
      MINUTE: 'call',
      SMS: 'chat',
    };

    return measure ? symbolMap[measure] || 'check_circle' : 'check_circle';
  }
}
