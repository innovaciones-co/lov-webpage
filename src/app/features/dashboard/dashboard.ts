import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { SubscriptionAccount } from '../../core/models/account.model';
import { CustomerSubscription } from '../../core/models/customer.model';
import { CapitalizePipe } from "../../core/pipes/capitalize.pipe";
import { MsisdnPipe } from "../../core/pipes/msisdn.pipe";
import { SubscriptionFacadeService } from '../../core/services/subscription-facade.service';
import { Loading } from "../../shared/components/loading/loading";
import { User } from '../authentication/models/auth.models';
import { AuthService } from '../authentication/services/auth.service';
import { RechargeScheduler } from './recharge-scheduler/recharge-scheduler';

type AccountLayout = 'currency' | 'data' | 'unlimited' | 'generic';

interface AccountViewModel {
  account: SubscriptionAccount;
  layout: AccountLayout;
  valueLabel: string;
  usagePercent?: number;
  balanceInGb?: string;
  totalInGb?: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, CapitalizePipe, Loading, MsisdnPipe, RechargeScheduler],
  templateUrl: './dashboard.html',
  styleUrls: [`./dashboard.scss`]
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private subscriptionFacade = inject(SubscriptionFacadeService);
  user: User | null = null;
  activeSubscriptions = signal<CustomerSubscription[]>([]);
  loading = signal(true);
  billingInfo: any = null;
  accounts = signal<SubscriptionAccount[]>([]);
  accountViews = computed<AccountViewModel[]>(() =>
    this.accounts().map((account) => this.toAccountViewModel(account))
  );

  submitError = signal<string>('');

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.user = user;
      this.loading.set(false);

      const storedMsisdn = this.authService.getStoredMsisdn();
      if (storedMsisdn) {
        this.subscriptionFacade.getCustomerInfo(storedMsisdn).subscribe(customerInfo => {
          if (customerInfo) {

            this.fetchAccounts(customerInfo.id.toString(), '16112018597');
            this.billingInfo = {
              firstName: customerInfo.givenName,
              lastName: customerInfo.familyName,
              documentType: customerInfo.document.type,
              documentNumber: customerInfo.document.id,
              email: customerInfo.email,
              phone: storedMsisdn,
              country: customerInfo.address.country,
              city: customerInfo.address.city,
              address: customerInfo.address.line1,
              additionalInfo: customerInfo.additionalInformationPlaceHolder.additionalInformationString || ''
            };
          }
        });

        this.subscriptionFacade.getActiveSubscriptions(storedMsisdn).subscribe(activeSubscriptions => {
          if (activeSubscriptions) {
            this.activeSubscriptions.set(activeSubscriptions);
          }
        });
      }

    });
  }

  logout() {
    this.authService.logout();
  }

  fetchAccounts(customerId: string, subscriptionId: string) {
    this.subscriptionFacade.getAccountsForSubscription(customerId, subscriptionId).subscribe(accounts => {
      this.accounts.set(accounts);
    });
  }

  private toAccountViewModel(account: SubscriptionAccount): AccountViewModel {
    if (this.isUnlimitedAccount(account)) {
      return {
        account,
        layout: 'unlimited',
        valueLabel: 'Ilimitados'
      };
    }

    if (this.isDataAccount(account)) {
      const usageRatio = this.getUsageRatio(account.balance, account.initialBalance);
      return {
        account,
        layout: 'data',
        valueLabel: `${Math.round(usageRatio * 100)}%`,
        usagePercent: Math.round(usageRatio * 100),
        balanceInGb: this.formatGb(account.balance),
        totalInGb: this.formatGb(account.initialBalance)
      };
    }

    if (this.isPesosAccount(account)) {
      const normalizedBalance = account.unit.relation > 0 ? account.balance / account.unit.relation : account.balance;
      return {
        account,
        layout: 'currency',
        valueLabel: this.formatPesos(normalizedBalance)
      };
    }

    const normalizedBalance = account.unit.relation > 0 ? account.balance / account.unit.relation : account.balance;
    return {
      account,
      layout: 'generic',
      valueLabel: `${this.formatNumber(normalizedBalance)} ${account.unit.name}`
    };
  }

  private isUnlimitedAccount(account: SubscriptionAccount): boolean {
    return account.type === 'UNLIMITED';
  }

  private isDataAccount(account: SubscriptionAccount): boolean {
    const unitName = account.unit.name.toLowerCase();
    return unitName.includes('byte') && account.name.toUpperCase() === 'MB';
  }

  private isPesosAccount(account: SubscriptionAccount): boolean {
    return account.name.toLowerCase().includes('pesos');
  }

  private getUsageRatio(balance: number, initialBalance: number): number {
    if (initialBalance <= 0) {
      return 0;
    }

    const ratio = balance / initialBalance;
    return Math.min(Math.max(ratio, 0), 1);
  }

  private formatGb(rawValue: number): string {
    const gb = rawValue / (1024 ** 3);
    return `${this.formatNumber(gb)} GB`;
  }

  private formatPesos(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  }
}
