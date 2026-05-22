import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, switchMap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { SubscriptionAccount } from '../models/account.model';
import { ApiResponse } from '../models/api-response.model';
import { CustomerSubscriptionResponse } from '../models/customer.model';

export interface GetSubscriptionParams {
    msisdn: string;
}

interface CustomerLookupResponse {
    id: number;
}

@Injectable({
    providedIn: 'root'
})
export class SubscriptionService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.gatewayUrl;

    /**
     * Retrieves subscription information for a given MSISDN
     * @param params - Object containing the MSISDN
     * @returns Observable of the subscription response
     */
    getSubscriptions(customerId: number): Observable<ApiResponse<CustomerSubscriptionResponse>> {
        return this.http.get<ApiResponse<CustomerSubscriptionResponse>>(
            `${this.baseUrl}/api/customers/${customerId}`,
        ).pipe(
            catchError(this.handleError)
        );
    }

    getCustomerId(params: GetSubscriptionParams): Observable<CustomerLookupResponse> {
        const httpParams = new HttpParams().set('msisdn', params.msisdn);

        return this.http.get<ApiResponse<CustomerLookupResponse>>(
            `${this.baseUrl}/api/subscriptions`,
            { params: httpParams }
        ).pipe(
            map((response) => response.payload),
            catchError(this.handleError)
        );
    }

    /**
     * Retrieves subscription information by MSISDN (convenience method)
     * @param msisdn - The MSISDN to query
     * @returns Observable of the subscription response
     */
    getSubscriptionsByMsisdn(msisdn: string): Observable<ApiResponse<CustomerSubscriptionResponse>> {
        return this.getCustomerId({ msisdn }).pipe(
            switchMap((response) => this.getSubscriptions(response.id))
        );
    }

    /**
     * Retrieves accounts for a given subscription and customer ID
     * @param customerId - The customer ID
     * @param subscriptionId - The subscription ID
     * @returns Observable of the accounts response
     */
    getAccounts(customerId: string, subscriptionId: string): Observable<ApiResponse<SubscriptionAccount[]>> {
        return this.http.get<ApiResponse<SubscriptionAccount[]>>(
            `${this.baseUrl}/api/customers/${customerId}/subscriptions/${subscriptionId}/accounts`,
            {
                headers: { 'accept': 'application/json' }
            }
        ).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Handles HTTP errors
     * @param error - The HTTP error
     * @returns Observable error
     */
    private handleError(error: any): Observable<never> {
        console.error('SubscriptionService error:', error);
        return throwError(() => error);
    }
}