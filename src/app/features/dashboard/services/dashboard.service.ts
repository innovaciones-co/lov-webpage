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

    private loading = signal<boolean>(false);
    private creditCardsData = signal<any>(null);

    constructor() {
        this.gatewayUrl = environment.gatewayUrl;
    }

    getCreditCards(customerId: string): Observable<any> {
        console.debug('Fetching credit cards');
        this.loading.set(true);

        const url = `${this.gatewayUrl}/api/customers/${customerId}/onlinePaymentProfiles`;

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

    resetState() {
        this.loading.set(false);
        this.creditCardsData.set(null);
    }
}
