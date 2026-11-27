import { Component, inject, input, Input, signal } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CurrencyPipe } from "../../../../core/pipes/currency.pipe";
import { PlanProduct } from '../../../payments/models/product.model';
import { PaymentService } from '../../../payments/services/payment.service';
import { ProductFactoryService } from '../../../payments/services/product-factory.service';
import { Feature, Plan } from '../../models/plan.model';

const SYMBOL_MAP: Record<string, string> = {
  'GB': 'language',
  'MB': 'language',
  'MINUTE': 'call',
  'SMS': 'chat',
};
const FEATURE_ORDER = Object.keys(SYMBOL_MAP);

interface Headline {
  value: string;
  unit: string;
}

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

  showDetails = signal(false);

  get orderedFeatures() {
    return [...this.plan.features].sort((left, right) =>
      FEATURE_ORDER.indexOf(left.measure) - FEATURE_ORDER.indexOf(right.measure)
    );
  }

  // The blue band: the plan's main feature (data for most plans, minutes for voice packs).
  get headline(): Headline | null {
    const main = this.mainFeature;
    if (!main) {
      return null;
    }
    if (main.quantity < 0) {
      return { value: '∞', unit: this.unitLabel(main) };
    }
    if (main.measure === 'MB' && main.quantity >= 1024) {
      return { value: this.trimNumber(main.quantity / 1024), unit: 'GB' };
    }
    return { value: this.trimNumber(main.quantity), unit: this.unitLabel(main) };
  }

  getMaterialSymbol(measure: string): string {
    return SYMBOL_MAP[measure] || 'check_circle';
  }

  toggleDetails(): void {
    this.showDetails.update(open => !open);
  }

  addPlanToCart() {
    this.paymentService.selectProduct(this.planToProduct());
  }

  private get mainFeature(): Feature | undefined {
    const features = this.plan.features ?? [];
    return features.find(f => f.isMainFeature || f.mainFeature)
      ?? features.find(f => f.measure === 'GB' || f.measure === 'MB')
      ?? features[0];
  }

  private unitLabel(feature: Feature): string {
    switch (feature.measure) {
      case 'MINUTE': return 'MIN';
      case 'SMS': return 'SMS';
      default: return feature.measure;
    }
  }

  private trimNumber(value: number): string {
    return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(value);
  }

  private planToProduct(): PlanProduct {
    return this.productFactoryService.createPlanProduct(this.plan);
  }
}
