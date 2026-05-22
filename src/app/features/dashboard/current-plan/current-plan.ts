import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountViewModel } from '../dashboard';

interface DisplayItem extends AccountViewModel {
  product: string;
  icon: string;
  balanceName: string;
}

@Component({
  selector: 'app-current-plan',
  imports: [CommonModule],
  templateUrl: './current-plan.html',
  styleUrl: './current-plan.scss'
})
export class CurrentPlan {
  accountViews = input.required<AccountViewModel[]>();

  pesoBalance = computed(() => {
    const currencyAccount = this.accountViews().find(account => account.name === 'Pesos');
    return currencyAccount?.balance.toString() || '-';
  });

  displayItems = computed(() => {
    console.log('accountViews:', (this.accountViews()));
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
