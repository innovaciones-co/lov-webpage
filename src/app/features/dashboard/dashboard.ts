import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { EMPTY, forkJoin, of, switchMap, tap } from 'rxjs';
import { SubscriptionAccount } from '../../core/models/account.model';
import { Customer, CustomerSubscription } from '../../core/models/customer.model';
import { SubscriptionFacadeService } from '../../core/services/subscription-facade.service';
import { InputTextComponent } from '../../shared/components/form-fields/input-text/input-text';
import { Loading } from "../../shared/components/loading/loading";
import { User } from '../authentication/models/auth.models';
import { AuthService } from '../authentication/services/auth.service';
import { PaymentCardSelector } from "../payments/components/payment-card-selector/payment-card-selector";
import { DataUsage } from "./components/data-usage/data-usage";
import { History } from "./components/history/history";
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
  imports: [CommonModule, Loading, CurrentPlan, DataUsage, InputTextComponent, History, PaymentCardSelector],
  templateUrl: './dashboard.html',
  styleUrls: [`./dashboard.scss`]
})
export class Dashboard implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly subscriptionFacade = inject(SubscriptionFacadeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly carouselItemsPerPage = 3;
  user: User | null = null;
  activeSubscriptions = signal<CustomerSubscription[]>([]);
  loading = signal(true);
  billingInfo: BillingInfo | null = null;

  // Billing form controls
  firstNameControl = new FormControl({ value: '', disabled: true });
  lastNameControl = new FormControl({ value: '', disabled: true });
  documentTypeControl = new FormControl({ value: '', disabled: true });
  documentNumberControl = new FormControl({ value: '', disabled: true });
  emailControl = new FormControl({ value: '', disabled: true });
  phoneControl = new FormControl({ value: '', disabled: true });
  countryControl = new FormControl({ value: '', disabled: true });
  cityControl = new FormControl({ value: '', disabled: true });
  addressControl = new FormControl({ value: '', disabled: true });
  additionalInfoControl = new FormControl({ value: '', disabled: true });

  accounts = signal<SubscriptionAccount[]>([]);
  accountViews = computed<AccountViewModel[]>(() =>
    this.groupAndNormalizeAccounts(this.accounts())
  );
  currentSubscription = signal<CustomerSubscription | null>(null);
  isAccountLoading = signal(false);
  carouselPage = signal(0);
  carouselDots = computed<number[]>(() => {
    const totalPages = Math.ceil(this.activeSubscriptions().length / this.carouselItemsPerPage);
    return totalPages > 1 ? Array.from({ length: totalPages }, (_, index) => index) : [];
  });
  @ViewChild('subscriptionsCarousel') private subscriptionsCarousel?: ElementRef<HTMLUListElement>;

  submitError = signal<string>('');

  ngOnInit() {
    this.authService.user$.pipe(
      tap((user) => {
        this.user = user;
        this.loading.set(false);
      }),
      switchMap(() => this.authService.getStoredMsisdn()),
      switchMap((storedMsisdn) => {
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
    this.isAccountLoading.set(true);
    this.subscriptionFacade.getAccountsForSubscription(customerId, subscriptionId).subscribe(accounts => {
      this.accounts.set(accounts);
      this.isAccountLoading.set(false);
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

  onSubscriptionsScroll(): void {
    const carouselElement = this.subscriptionsCarousel?.nativeElement;
    if (!carouselElement) {
      return;
    }

    const maxPageIndex = Math.max(0, this.carouselDots().length - 1);
    const maxScrollLeft = carouselElement.scrollWidth - carouselElement.clientWidth;

    if (maxPageIndex === 0 || maxScrollLeft <= 0) {
      this.carouselPage.set(0);
      return;
    }

    const scrollRatio = carouselElement.scrollLeft / maxScrollLeft;
    const pageFromScroll = Math.round(scrollRatio * maxPageIndex);
    this.carouselPage.set(Math.min(Math.max(pageFromScroll, 0), maxPageIndex));
  }

  goToSubscriptionsPage(pageIndex: number): void {
    const carouselElement = this.subscriptionsCarousel?.nativeElement;
    if (!carouselElement) {
      return;
    }

    const maxPageIndex = Math.max(0, this.carouselDots().length - 1);
    const targetPage = Math.min(Math.max(pageIndex, 0), maxPageIndex);
    this.carouselPage.set(targetPage);

    const maxScrollLeft = carouselElement.scrollWidth - carouselElement.clientWidth;
    const targetScrollLeft = maxPageIndex > 0
      ? (targetPage / maxPageIndex) * maxScrollLeft
      : 0;

    carouselElement.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth'
    });
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

    // Update form controls with billing info and apply transformations
    this.firstNameControl.setValue(this.capitalize(this.billingInfo.firstName));
    this.lastNameControl.setValue(this.capitalize(this.billingInfo.lastName));
    this.documentTypeControl.setValue(this.billingInfo.documentType);
    this.documentNumberControl.setValue(this.billingInfo.documentNumber);
    this.emailControl.setValue(this.billingInfo.email);
    this.phoneControl.setValue(this.formatMsisdn(this.billingInfo.phone));
    this.countryControl.setValue(this.capitalize(this.billingInfo.country));
    this.cityControl.setValue(this.capitalize(this.billingInfo.city));
    this.addressControl.setValue(this.billingInfo.address);
    this.additionalInfoControl.setValue(this.billingInfo.additionalInfo);
  }

  private capitalize(value: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  private formatMsisdn(msisdn: string): string {
    if (!msisdn || !msisdn.startsWith('57')) return msisdn;
    return msisdn.substring(2);
  }

  private setInitialSubscription(customerId: string, subscriptions: CustomerSubscription[]): void {
    if (!subscriptions.length) {
      return;
    }

    const firstSubscription = subscriptions[0];
    this.activeSubscriptions.set(subscriptions);
    this.carouselPage.set(0);

    this.subscriptionsCarousel?.nativeElement.scrollTo({
      left: 0,
      behavior: 'auto'
    });

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
