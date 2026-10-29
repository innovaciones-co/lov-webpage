import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';

import { SubscriptionAccount } from '../models/account.model';
import { ApiResponse } from '../models/api-response.model';
import { CustomerSubscription, CustomerSubscriptionResponse } from '../models/customer.model';
import { SubscriptionService } from './subscription.service';

@Injectable({
    providedIn: 'root'
})
export class SubscriptionFacadeService {
    private readonly subscriptionService = inject(SubscriptionService);
    private readonly http = inject(HttpClient);

    /**
     * Every line of the signed-in account, in any state, from all the CYAN customers it groups
     * (CYAN creates one customer per SIM). Null when signed out or if the request fails.
     */
    getAccountLines(): Observable<CustomerSubscription[] | null> {
        return this.http.get<CustomerSubscription[]>(`${environment.apiUrl}/me/lines`).pipe(
            catchError(() => of(null))
        );
    }

    /**
     * Active lines of the signed-in account (see getAccountLines), the line [msisdn] first.
     * Falls back to that line's own customer when signed out or when the account lookup fails.
     */
    getMyLines(msisdn: string): Observable<CustomerSubscription[]> {
        const local = msisdn.slice(-10);
        return this.getAccountLines().pipe(
            map(lines => (lines ?? []).filter(line => line.state === 'ACTIVE')),
            map(lines => [...lines].sort((a, b) => Number(b.msisdn.endsWith(local)) - Number(a.msisdn.endsWith(local)))),
            switchMap(lines => lines.length ? of(lines) : this.getActiveSubscriptions(msisdn))
        );
    }

    /** Account views must use the signed-in customer, not a previously stored line. */
    getCustomerWithSubscriptionsByCustomerId(customerId: number): Observable<ApiResponse<CustomerSubscriptionResponse> | null> {
        return this.subscriptionService.getSubscriptions(customerId).pipe(
            catchError(() => of(null))
        );
    }

    /**
     * Get complete customer and subscription information by MSISDN
     */
    getCustomerWithSubscriptions(msisdn: string): Observable<ApiResponse<CustomerSubscriptionResponse> | null> {
        return this.subscriptionService.getSubscriptionsByMsisdn(msisdn).pipe(
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
        return this.subscriptionService.getSubscriptionsByMsisdn(msisdn).pipe(
            map(response => response?.payload?.subscriptions?.filter(sub => sub.state === 'ACTIVE') || []),
            catchError(() => of([]))
        );
    }

    /**
     * Get customer basic information by MSISDN
     */
    getCustomerInfo(msisdn: string): Observable<Omit<CustomerSubscriptionResponse, 'subscriptions'> | null> {
        return this.subscriptionService.getSubscriptionsByMsisdn(msisdn).pipe(
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
        return this.subscriptionService.getSubscriptionsByMsisdn(msisdn).pipe(
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
            map(response => response?.payload.filter(sub => Date.parse(sub.expiryDate) >= Date.now()) || []),
            catchError(() => of([]))
        );
    }
}
