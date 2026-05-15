import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';

import { SubscriptionAccount } from '../models/account.model';
import { ApiResponse } from '../models/api-response.model';
import { CustomerSubscription, CustomerSubscriptionResponse } from '../models/customer.model';
import { SubscriptionService } from './subscription.service';

@Injectable({
    providedIn: 'root'
})
export class SubscriptionFacadeService {
    private readonly subscriptionService = inject(SubscriptionService);

    /**
     * Get complete customer and subscription information by MSISDN
     */
    getCustomerWithSubscriptions(msisdn: string): Observable<ApiResponse<CustomerSubscriptionResponse> | null> {
        return this.subscriptionService.getSubscriptionByMsisdn(msisdn).pipe(
            catchError((error) => {
                console.error('Failed to fetch customer subscriptions:', error);
                return of(null);
            })
        );
    }

    /**
     * Get only active subscriptions for a customer by MSISDN
     */
    getActiveSubscriptions(msisdn: string): Observable<CustomerSubscription[]> {
        return this.subscriptionService.getSubscriptionByMsisdn(msisdn).pipe(
            map(response => response?.payload?.subscriptions?.filter(sub => sub.state === 'ACTIVE') || []),
            catchError(() => of([]))
        );
    }

    /**
     * Get customer basic information by MSISDN
     */
    getCustomerInfo(msisdn: string): Observable<Omit<CustomerSubscriptionResponse, 'subscriptions'> | null> {
        return this.subscriptionService.getSubscriptionByMsisdn(msisdn).pipe(
            map(response => {
                if (!response?.payload) return null;
                const { subscriptions, ...customerInfo } = response.payload;
                return customerInfo;
            }),
            catchError(() => of(null))
        );
    }

    /**
     * Check if a customer has any active subscriptions
     */
    hasActiveSubscriptions(msisdn: string): Observable<boolean> {
        return this.getActiveSubscriptions(msisdn).pipe(
            map(subscriptions => subscriptions.length > 0)
        );
    }

    /**
     * Get subscription by specific subscription ID
     */
    getSubscriptionById(msisdn: string, subscriptionId: number): Observable<CustomerSubscription | null> {
        return this.subscriptionService.getSubscriptionByMsisdn(msisdn).pipe(
            map(response =>
                response?.payload?.subscriptions?.find(sub => sub.id === subscriptionId) || null
            ),
            catchError(() => of(null))
        );
    }

    /**
     * Get accounts for a given subscription and customer ID
     */
    getAccountsForSubscription(customerId: string, subscriptionId: string): Observable<SubscriptionAccount[]> {
        return this.subscriptionService.getAccounts(customerId, subscriptionId).pipe(
            map(response => response?.payload || []),
            catchError(() => of([]))
        );
    }
}