import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { EMPTY, forkJoin, of, switchMap, tap } from 'rxjs';
import { SubscriptionAccount } from '../../core/models/account.model';
import { Customer, CustomerSubscription } from '../../core/models/customer.model';
import { LineAliasService } from '../../core/services/line-alias.service';
import { SubscriptionFacadeService } from '../../core/services/subscription-facade.service';
import { Loading } from "../../shared/components/loading/loading";
import { User } from '../authentication/models/auth.models';
import { AuthService } from '../authentication/services/auth.service';
import { PaymentCardSelector } from "../payments/components/payment-card-selector/payment-card-selector";
import { DataUsage } from "./components/data-usage/data-usage";
import { History } from "./components/history/history";
import { LineSwitcher } from './components/line-switcher/line-switcher';
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

interface InfoSection {
  title: string;
  items: { icon: string; label: string; value: string }[];
}

// A shortcut tile: goes to a page (route), opens a link (href) or scrolls to a section (anchor).
interface QuickAction {
  label: string;
  icon: string;
  tone: string;
  route?: string;
  href?: string;
  anchor?: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, Loading, CurrentPlan, DataUsage, History, PaymentCardSelector, LineSwitcher],
  templateUrl: './dashboard.html',
  styleUrls: [`./dashboard.scss`]
})
export class Dashboard implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly subscriptionFacade = inject(SubscriptionFacadeService);
  private readonly lineAliases = inject(LineAliasService);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  user: User | null = null;
  activeSubscriptions = signal<CustomerSubscription[]>([]);
  loading = signal(true);
  // The lines come after the user, from CYAN: avoids flashing "no lines" meanwhile.
  linesLoading = signal(true);
  firstName = signal('');
  billingInfo: BillingInfo | null = null;

  readonly quickActions: QuickAction[] = [
    { label: 'Recargar', icon: 'bolt', tone: '#FF0000', route: '/recargas' },
    { label: 'Comprar plan', icon: 'shopping_bag', tone: '#066EF1', route: '/planes' },
    { label: 'Mi consumo', icon: 'insights', tone: '#6C00BB', anchor: 'history' },
    { label: 'Mis tarjetas', icon: 'credit_card', tone: '#052B6C', anchor: 'cards' },
    { label: 'Ayuda', icon: 'support_agent', tone: '#00A0FF', href: 'https://wa.me/573330522222' },
  ];

  // Read-only billing/contact details, shown as information rather than disabled inputs.
  billingSections: InfoSection[] = [];

  accounts = signal<SubscriptionAccount[]>([]);
  accountViews = computed<AccountViewModel[]>(() =>
    this.groupAndNormalizeAccounts(this.accounts())
  );
  currentSubscription = signal<CustomerSubscription | null>(null);
  isAccountLoading = signal(false);

  submitError = signal<string>('');

  ngOnInit() {
    this.lineAliases.load();

    this.authService.user$.pipe(
      tap((user) => {
        this.user = user;
        this.loading.set(false);
      }),
      switchMap(() => this.authService.getStoredMsisdn()),
      switchMap((storedMsisdn) => {
        if (!storedMsisdn) {
          this.linesLoading.set(false);
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
      this.linesLoading.set(false);
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

  selectSubscription(subscription: CustomerSubscription): void {
    this.currentSubscription.set(subscription);
    this.fetchAccounts(subscription.customerId, subscription.id.toString());
  }

  scrollTo(anchor: string): void {
    this.document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    const info = this.billingInfo;
    this.firstName.set(this.capitalize(info.firstName?.trim().split(/\s+/)[0] ?? ''));
    const fullName = [this.capitalize(info.firstName), this.capitalize(info.lastName)].filter(Boolean).join(' ');
    const location = [this.capitalize(info.city), info.country?.toUpperCase()].filter(Boolean).join(', ');

    this.billingSections = [
      {
        title: 'Datos de facturación',
        items: [
          { icon: 'person', label: 'Nombre', value: fullName },
          { icon: 'badge', label: 'Documento', value: [info.documentType, info.documentNumber].filter(Boolean).join(' ') },
        ],
      },
      {
        title: 'Información de contacto',
        items: [
          { icon: 'mail', label: 'Correo electrónico', value: info.email },
          { icon: 'call', label: 'Teléfono', value: this.formatMsisdn(info.phone) },
          { icon: 'location_on', label: 'Ciudad', value: location },
          { icon: 'home', label: 'Dirección', value: info.address },
          { icon: 'notes', label: 'Información adicional', value: info.additionalInfo },
        ].filter(item => !!item.value),
      },
    ];
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
