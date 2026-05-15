import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";

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

    getCreditCards(): Observable<any> {
        console.debug('Fetching credit cards');
        this.loading.set(true);

        const url = `${this.apiUrl}/paymentMethods`;

        return this.http.get(url);
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

        const url = `${this.gatewayUrl}/api/subscriptions/${subscriptionId}/autoTopup/scheduled/info`;

        return this.http.get(url);
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
