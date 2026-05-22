import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, forkJoin, of, switchMap, tap } from 'rxjs';
import { SubscriptionAccount } from '../../core/models/account.model';
import { Customer, CustomerSubscription } from '../../core/models/customer.model';
import { CapitalizePipe } from "../../core/pipes/capitalize.pipe";
import { MsisdnPipe } from "../../core/pipes/msisdn.pipe";
import { SubscriptionFacadeService } from '../../core/services/subscription-facade.service';
import { Loading } from "../../shared/components/loading/loading";
import { User } from '../authentication/models/auth.models';
import { AuthService } from '../authentication/services/auth.service';
import { DataUsage } from "./components/data-usage/data-usage";
import { RechargeScheduler } from './components/recharge-scheduler/recharge-scheduler';
import { CurrentPlan } from './current-plan/current-plan';

export interface AccountViewModel {
  name: string;
  balance: number;
  initialBalance: number;
  type: string;
}

interface BillingInfo {
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  additionalInfo: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, CapitalizePipe, Loading, MsisdnPipe, RechargeScheduler, CurrentPlan, DataUsage],
  templateUrl: './dashboard.html',
  styleUrls: [`./dashboard.scss`]
})
export class Dashboard implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly subscriptionFacade = inject(SubscriptionFacadeService);
  private readonly destroyRef = inject(DestroyRef);
  user: User | null = null;
  activeSubscriptions = signal<CustomerSubscription[]>([]);
  loading = signal(true);
  billingInfo: BillingInfo | null = null;
  accounts = signal<SubscriptionAccount[]>([]);
  accountViews = computed<AccountViewModel[]>(() =>
    this.groupAndNormalizeAccounts(this.accounts())
  );
  currentSubscription = signal<CustomerSubscription | null>(null);

  submitError = signal<string>('');

  ngOnInit() {
    this.authService.user$.pipe(
      tap((user) => {
        this.user = user;
        this.loading.set(false);
      }),
      switchMap(() => {
        const storedMsisdn = this.authService.getStoredMsisdn();
        if (!storedMsisdn) {
          return EMPTY;
        }

        return forkJoin({
          customerInfo: this.subscriptionFacade.getCustomerInfo(storedMsisdn),
          activeSubscriptions: this.subscriptionFacade.getActiveSubscriptions(storedMsisdn),
          storedMsisdn: of(storedMsisdn)
        });
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(({ customerInfo, activeSubscriptions, storedMsisdn }) => {
      if (!customerInfo) {
        return;
      }

      this.setBillingInfo(customerInfo, storedMsisdn);
      this.setInitialSubscription(customerInfo.id.toString(), activeSubscriptions);
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

  getSubscriptionType(paymentType: string): string {
    switch (paymentType) {
      case 'PREPAID':
        return 'Prepago';
      default:
        return 'Postpago';
    }
  }

  getStateLabel(state: string): string {
    switch (state) {
      case 'ACTIVE':
        return 'Activo';
      case 'INACTIVE':
        return 'Inactivo';
      case 'SUSPENDED':
        return 'Suspendido';
      default:
        return state;
    }
  }

  selectSubscription(subscription: CustomerSubscription): void {
    this.currentSubscription.set(subscription);
    this.fetchAccounts(subscription.customerId, subscription.id.toString());
  }

  private setBillingInfo(customerInfo: Omit<Customer, 'subscriptions'>, storedMsisdn: string): void {
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

  private setInitialSubscription(customerId: string, subscriptions: CustomerSubscription[]): void {
    if (!subscriptions.length) {
      return;
    }

    const firstSubscription = subscriptions[0];
    this.activeSubscriptions.set(subscriptions);
    this.currentSubscription.set(firstSubscription);
    this.fetchAccounts(customerId, firstSubscription.id.toString());
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
