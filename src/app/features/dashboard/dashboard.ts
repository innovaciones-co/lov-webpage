import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { CustomerSubscription } from '../../core/models/customer.model';
import { CapitalizePipe } from "../../core/pipes/capitalize.pipe";
import { SubscriptionFacadeService } from '../../core/services/subscription-facade.service';
import { User } from '../authentication/models/auth.models';
import { AuthService } from '../authentication/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, CapitalizePipe],
  templateUrl: './dashboard.html',
  styleUrls: [`./dashboard.scss`]
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private subscriptionFacade = inject(SubscriptionFacadeService);
  user: User | null = null;
  activeSubscriptions: CustomerSubscription[] = [];

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.user = user;

      const storedMsisdn = this.authService.getStoredMsisdn();
      if (storedMsisdn) {
        this.subscriptionFacade.getActiveSubscriptions(storedMsisdn).subscribe(activeSubscriptions => {
          if (activeSubscriptions) {
            this.activeSubscriptions = activeSubscriptions;
          }
        });
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
