import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { Observable, map } from "rxjs";
import { environment } from "../../../../environments/environment";
import { PaymentMethodPayload } from "../../payments/models/payment-method.model";
import { Plan } from "../../plans/models/plan.model";

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private http = inject(HttpClient);
    private readonly gatewayUrl;
    private readonly apiUrl;

    private loading = signal<boolean>(false);
    private creditCardsData = signal<any>(null);
    private rechargeData = signal<any>(null);

    constructor() {
        this.gatewayUrl = environment.gatewayUrl;
        this.apiUrl = environment.apiUrl;
    }

    getCreditCards(subscriberId: number): Observable<PaymentMethodPayload[]> {
        console.debug('Fetching credit cards');
        this.loading.set(true);

        const url = `${this.apiUrl}/paymentMethods`;

        return this.http.get<PaymentMethodPayload[]>(url, { params: { subscriberId } });
    }

    getCurrentPlan(subscriptionId: string): Observable<Plan | null> {
        console.debug('Fetching current plan');
        this.loading.set(true);

        const url = `${this.apiUrl}/plans/currentPlan/${subscriptionId}`;

        return this.http.get<Plan | null>(url);
    }

    deactivateCurrentPlan(subscriptionId: string): Observable<any> {
        console.debug('Deactivating current plan');
        this.loading.set(true);

        const url = `${this.apiUrl}/plans/currentPlan/${subscriptionId}/deactivate`;

        return this.http.put(url, null);
    }

    submitRecharge(subscriptionId: string, rechargeData: any): Observable<any> {
        console.debug('Submitting recharge request');
        console.log('Recharge data:', rechargeData);
        this.loading.set(true);

        const url = `${this.apiUrl}/paymentMethods/schedule/${subscriptionId}`; // TODO: actualizar endpoint

        return this.http.post(url, rechargeData);
    }

    getSavedRecharge(subscriptionId: string): Observable<any> {
        console.debug('Fetching saved recharge information');
        this.loading.set(true);

        const url = `${this.apiUrl}/paymentMethods/schedule`;
        return this.http.get<{ amount: number; dayOfMonth?: number; intervalDays?: number } | null>(url, {
            params: { subscriberId: subscriptionId }
        }).pipe(map(schedule => ({ autoTopup: schedule ? {
            topupAmount: schedule.amount * 100,
            schedule: { dayOfMonth: schedule.dayOfMonth, frequency: schedule.dayOfMonth ? 'Mensual' : `Cada ${schedule.intervalDays} días` }
        } : null })));
    }

    deleteScheduledRecharge(subscriptionId: string): Observable<any> {
        console.debug('Deleting scheduled recharge');
        this.loading.set(true);

        const url = `${this.apiUrl}/paymentMethods/schedule`;
        return this.http.delete(url, { params: { subscriberId: subscriptionId } });
    }

    getLoadingSignal() {
        return this.loading.asReadonly();
    }

    getCreditCardsData() {
        return this.creditCardsData.asReadonly();
    }

    setCreditCardsData(data: any) {
        this.creditCardsData.set(data);
    }

    getRechargeData() {
        return this.rechargeData.asReadonly();
    }

    setRechargeData(data: any) {
        this.rechargeData.set(data);
    }

    resetState() {
        this.loading.set(false);
        this.creditCardsData.set(null);
        this.rechargeData.set(null);
    }
}
