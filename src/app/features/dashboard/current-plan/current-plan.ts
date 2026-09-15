import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Loading } from '../../../shared/components/loading/loading';
import { Plan } from '../../plans/models/plan.model';
import { PaymentService } from '../../payments/services/payment.service';
import { ProductFactoryService } from '../../payments/services/product-factory.service';
import { DashboardService } from '../services/dashboard.service';
import { AccountViewModel } from '../dashboard';
import { Modal } from "../../../shared/components/modal/modal";

interface DisplayItem extends AccountViewModel {
  product: string;
  icon: string;
  balanceName: string;
}

@Component({
  selector: 'app-current-plan',
  imports: [CommonModule, Loading, Modal],
  templateUrl: './current-plan.html',
  styleUrl: './current-plan.scss'
})
export class CurrentPlan {
  private readonly router = inject(Router);
  private readonly dashboardService = inject(DashboardService);
  private readonly paymentService = inject(PaymentService);
  private readonly productFactoryService = inject(ProductFactoryService);

  accountViews = input.required<AccountViewModel[]>();
  isAccountLoading = input(false);
  subscriptionId = input<number | null>(null);
  currentPlan = signal<Plan | null>(null);
  showModal = signal(false);

  constructor() {
    effect(() => {
      const subscriptionId = this.subscriptionId();
      if (subscriptionId === null) {
        this.currentPlan.set(null);
        return;
      }

      this.currentPlan.set(null);
      this.dashboardService.getCurrentPlan(subscriptionId.toString()).subscribe({
        next: (plan) => this.currentPlan.set(plan)
      });
    });
  }

  pesoBalance = computed(() => {
    const currencyAccount = this.accountViews().find(account => account.name === 'Pesos');
    return currencyAccount?.balance.toString() || '-';
  });

  viewOtherPlans(): void {
    this.router.navigate(['/planes']);
  }

  buyPlan(): void {
    const plan = this.currentPlan();
    if (!plan) {
      return;
    }

    this.paymentService.selectProduct(this.productFactoryService.createPlanProduct(plan));
    this.router.navigate(['/pagos']);
  }

  openCancellationModal(): void {
    this.showModal.set(true);
  }

  onCancelModal(): void {
    this.showModal.set(false);
  }

  onContinueModal(): void {
    this.showModal.set(false);
    this.deactivateCurrentPlan();
  }

  deactivateCurrentPlan(): void {
    const subscriptionId = this.subscriptionId();
    if (subscriptionId === null) {
      return;
    }

    this.dashboardService.deactivateCurrentPlan(subscriptionId.toString()).subscribe({
      next: () => {
        this.dashboardService.getCurrentPlan(subscriptionId.toString()).subscribe({
          next: (plan) => this.currentPlan.set(plan)
        });
      }
    });
  }

  displayItems = computed(() => {
    //console.log('accountViews:', (this.accountViews()));
    return this.accountViews()
      .filter(account => account.name !== 'Pesos')
      .map(view => {
        const product = this.getProduct(view.name);
        return {
          name: view.name,
          balance: view.balance,
          type: view.type,
          product: product,
          icon: this.getIcon(product),
          balanceName: this.getBalanceName(view.type, view.balance)
        } as DisplayItem;
      });
  });

  private getProduct(name: string): string {
    switch (true) {
      case name.includes('WA'):
        return 'WA';
      case name.includes('SMS'):
        return 'SMS';
      case name.includes('Min'):
        return 'MIN';
      case name.includes('MB') || name.includes('GB'):
        return 'DATA';
      default:
        return '';
    }
  }

  private getIcon(product: string): string {
    switch (product) {
      case 'WA':
        return 'chat';
      case 'SMS':
        return 'sms';
      case 'MIN':
        return 'call';
      case 'DATA':
        return 'mail';
      default:
        return 'language';
    }
  }

  private getBalanceName(type: string, balance: number): string {
    if (type === 'UNLIMITED') return 'Ilimitado';
    return Math.floor(balance).toString();
  }
}
