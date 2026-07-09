import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { MsisdnPipe } from '../../../core/pipes/msisdn.pipe';

@Injectable({
    providedIn: 'root'
})
export class DeviceLockService {
    http = inject(HttpClient);
    msisdnPipe = inject(MsisdnPipe);
    private readonly gatewayUrl;

    constructor() {
        this.gatewayUrl = environment.gatewayUrl;
    }

    async getSubscriber(msisdn: string): Promise<any> {
        try {
            console.debug('Fetching subscriber for MSISDN:', msisdn);
            const transformedMsisdn = this.msisdnPipe.transform(msisdn);
            const url = `${this.gatewayUrl}/api/subscriptions?msisdn=${transformedMsisdn}`;

            const response = await firstValueFrom(this.http.get<ApiResponse<any>>(url));
            return response.payload;
        } catch (error: any) {
            console.error('Error fetching subscriber:', error);
            throw error;
        }
    }

    async getImeiList(subscriptionId: string): Promise<any[]> {
        try {
            const url = `${this.gatewayUrl}/api/handset/query/local/imei/status/subscriptions/${subscriptionId}`;
            const response = await firstValueFrom(this.http.post<ApiResponse<any>>(url, {}));
            const imeiList = response.payload?.imei;
            return imeiList ? [{ label: imeiList, value: imeiList }] : [];
        } catch (error: any) {
            console.error('Error fetching IMEI list:', error);
            throw error;
        }
    }

    async lockDevice(subscriptionId: string, deviceData: any): Promise<any> {
        try {
            console.debug('Submitting device lock request with data:', deviceData);
            const url = `${this.gatewayUrl}/api/subscriptions/${subscriptionId}/handset/block`;

            const response = await firstValueFrom(this.http.put<ApiResponse<any>>(url, deviceData));
            return response.payload;
        } catch (error: any) {
            console.error('Error locking device:', error);
            throw error;
        }
    }
}
