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
import { CurrentPlan } from './current-plan/current-plan';
import { RechargeScheduler } from './components/recharge-scheduler/recharge-scheduler';
import { DataUsage } from "./components/data-usage/data-usage";

export interface AccountViewModel {
  name: string;
  balance: number;
  initialBalance: number;
  type: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, CapitalizePipe, Loading, MsisdnPipe, RechargeScheduler, CurrentPlan, DataUsage],
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
    this.groupAndNormalizeAccounts(this.accounts())
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

  private groupAndNormalizeAccounts(data: SubscriptionAccount[]): AccountViewModel[] {
    const grouped = Object.values(
      data.reduce((acc, item) => {
        const key = item.name;

        if (!acc[key]) {
          acc[key] = {
            name: key,
            balance: 0,
            initialBalance: 0,
            type: item.type as AccountViewModel['type'],
            relation: item.unit?.relation || 1
          };
        }

        acc[key].balance += item.balance || 0;
        acc[key].initialBalance += item.initialBalance || 0;

        // Si alguno es UNLIMITED, el grupo completo queda UNLIMITED
        if (item.type === 'UNLIMITED') {
          acc[key].type = 'UNLIMITED' as const;
        }

        return acc;
      }, {} as Record<string, any>)
    );

    // Normalizar por relation
    return grouped.map(item => ({
      name: item.name,
      balance: item.relation > 0 ? item.balance / item.relation : item.balance,
      initialBalance: item.relation > 0 ? item.initialBalance / item.relation : item.initialBalance,
      type: item.type
    }));
  }
}
