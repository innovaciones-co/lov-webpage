import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CustomerSubscription } from '../../core/models/customer.model';
import { CapitalizePipe } from "../../core/pipes/capitalize.pipe";
import { MsisdnPipe } from "../../core/pipes/msisdn.pipe";
import { SubscriptionFacadeService } from '../../core/services/subscription-facade.service';
import { Loading } from "../../shared/components/loading/loading";
import { User } from '../authentication/models/auth.models';
import { AuthService } from '../authentication/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, CapitalizePipe, Loading, MsisdnPipe],
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
  accounts = signal<any[]>([]);

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
}
