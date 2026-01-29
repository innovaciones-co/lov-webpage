import { Component, inject, input, Input } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CurrencyPipe } from "../../../../core/pipes/currency.pipe";
import { PlanProduct } from '../../../payments/models/product.model';
import { PaymentService } from '../../../payments/services/payment.service';
import { ProductFactoryService } from '../../../payments/services/product-factory.service';
import { Plan } from '../../models/plan.model';

@Component({
  selector: 'app-plan-item',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './plan-item.html',
  styleUrl: './plan-item.scss'
})
export class PlanItem {
  @Input() plan!: Plan;
  enableHoverEffect = input(false);

  private paymentService = inject(PaymentService);
  private productFactoryService = inject(ProductFactoryService);

  getMaterialSymbol(measure: string): string {
    const symbolMap: Record<string, string> = {
      'GB': 'mail',
      'MB': 'mail',
      'MINUTE': 'call',
      'SMS': 'chat',
    };
    return symbolMap[measure] || 'check_circle';
  }

  addPlanToCart() {
    console.log('Adding plan to cart:', this.plan);
    this.paymentService.selectProduct(this.planToProduct());
  }

  private planToProduct(): PlanProduct {
    console.log('Converting plan to product:', this.plan);
    return this.productFactoryService.createPlanProduct(this.plan);
  }
}
