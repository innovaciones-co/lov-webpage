import { Component, computed, effect, input, signal } from '@angular/core';
import { Loading } from '../../../../shared/components/loading/loading';

export interface AccountViewModel {
  name: string;
  balance: number;
  initialBalance: number;
  type: string;
}

@Component({
  selector: 'app-data-usage',
  imports: [Loading],
  templateUrl: './data-usage.html',
  styleUrl: './data-usage.scss'
})
export class DataUsage {
  accountViews = input.required<AccountViewModel[]>();
  isAccountLoading = input(false);

  dataAccount = computed(() => {
    return this.accountViews().find(account => account.name === 'MB');
  });

  convertToGB(value: number, type: 'Bytes' | 'MB' | 'GB'): number {
    let valueInGB: number;

    switch (type) {
      case 'Bytes':
        valueInGB = value / (1024 * 1024 * 1024);
        break;
      case 'MB':
        valueInGB = value / 1024;
        break;
      case 'GB':
        valueInGB = value;
        break;
      default:
        valueInGB = 0;
    }

    return Math.round(valueInGB * 100) / 100;
  }

  usedData = computed(() => {
    const mb = this.dataAccount();
    if (!mb) return 0;
    if (mb.type === 'UNLIMITED') return 100;
    return this.convertToGB(mb.balance, 'MB');
  });

  totalData = computed(() => {
    const mb = this.dataAccount();
    if (!mb) return 0;
    if (mb.type === 'UNLIMITED') return 100;
    return this.convertToGB(mb.initialBalance, 'MB');
  });

  progressPercentage = computed(() => {
    const used = this.usedData();
    const total = this.totalData();
    if (total === 0) return 0;
    return (used / total) * 100;
  });
}
