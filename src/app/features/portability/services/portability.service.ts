import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { MsisdnPipe } from '../../../core/pipes/msisdn.pipe';
import { LookupResponse, SubscriptionResponse } from '../models/portability.models';

@Injectable({
  providedIn: 'root'
})
export class PortabilityService {
  http = inject(HttpClient);
  msisdnPipe = inject(MsisdnPipe);
  private readonly gatewayUrl;

  constructor() {
    this.gatewayUrl = environment.gatewayUrl;
  }

  // Signals for state management
  isValidatingDonorNumber = signal<boolean>(false);
  donorValidationResult = signal<any>(null);
  donorValidationError = signal<string | null>(null);

  isValidatingSim = signal<boolean>(false);
  simValidationResult = signal<boolean | null>(null);
  simValidationError = signal<string | null>(null);

  async validateDonorNumber(donorNumber: string): Promise<void> {
    this.isValidatingDonorNumber.set(true);
    this.donorValidationError.set(null);

    try {
      const url = `${environment.gatewayUrl}/api/mnp/lookup/${donorNumber}`;
      const result = await firstValueFrom(this.http.get(url));

      console.debug('Donor number validation result:', result);

      this.donorValidationResult.set(result);
    } catch (error: any) {
      this.donorValidationError.set(error.message || 'Error validating donor number');
      this.donorValidationResult.set(null);
    } finally {
      this.isValidatingDonorNumber.set(false);
    }
  }

  async validateSimCard(msisdn: string, iccid: string): Promise<{ isValid: boolean; payload?: any }> {
    this.isValidatingSim.set(true);
    this.simValidationError.set(null);
    this.simValidationResult.set(null);

    try {
      const transformedMsisdn = this.msisdnPipe.transform(msisdn);
      const url = `${environment.gatewayUrl}/api/subscriptions?msisdn=${transformedMsisdn}`;

      const response = await firstValueFrom(this.http.get<ApiResponse<SubscriptionResponse>>(url));

      // The SIM of the line typed must end with those digits (the customer may have other lines).
      const subscriptions = response?.payload?.subscriptions ?? [];
      const line = subscriptions.find(subscription => subscription.msisdn?.endsWith(msisdn));
      const isValid = (line ? [line] : subscriptions).some(subscription => subscription.iccid?.endsWith(iccid));

      this.simValidationResult.set(isValid);

      return {
        isValid,
        payload: isValid ? response?.payload : undefined
      };
    } catch (error: any) {
      this.simValidationError.set(error.message || 'Error validating SIM card');
      this.simValidationResult.set(false);
      return { isValid: false };
    } finally {
      this.isValidatingSim.set(false);
    }
  }

  async lookupByMsisdn(msisdn: string): Promise<LookupResponse | null> {
    try {
      const transformedMsisdn = this.msisdnPipe.transform(msisdn);
      const url = `${environment.gatewayUrl}/api/mnp/lookup/${transformedMsisdn}`;

      const response = await firstValueFrom(this.http.get<ApiResponse<LookupResponse>>(url));
      return response.payload;
    } catch (error) {
      console.error('Error looking up subscription by MSISDN:', error);
      return null;
    }
  }

  validatePortabilityStatus(lovNumber: string): Observable<any> {
    console.debug('Validating portability status for LOV number:', lovNumber);
    this.isValidatingDonorNumber.set(true);
    this.donorValidationError.set(null);

    const transformedMsisdn = this.msisdnPipe.transform(lovNumber);

    const url = `${this.gatewayUrl}/api/mnp/portin/status/${transformedMsisdn}`;

    return this.http.get(url);
  }

  /**
   * Status of a port-in found by the number being brought (or the LOV number) and the
   * customer's document: the website's own API checks the document before asking CYAN.
   */
  checkPortabilityStatus(number: string, documentId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/portabilities/status`, { number, documentId });
  }

  /**
   * The LOV line the number is brought to: the one typed in step 1. CYAN returns all the
   * customer's lines, and the first isn't always that one.
   */
  private lovSubscription(portabilityData: any): any {
    const subscriptions: any[] = portabilityData?.payload?.subscriptions ?? [];
    const lovNumber: string = portabilityData?.lovNumber ?? '';
    return subscriptions.find(subscription => lovNumber && subscription.msisdn?.endsWith(lovNumber)) ?? subscriptions[0];
  }

  /** Records a port-in just requested, so it can be checked later by number and document. Best effort. */
  recordPortability(customerData: any, donorData: any, portabilityData: any): void {
    const body = {
      lovMsisdn: portabilityData?.lovNumber,
      subscriptionId: this.lovSubscription(portabilityData)?.id,
      donorMsisdn: donorData?.donorNumber,
      donorOperator: donorData?.donorOperator,
      documentType: customerData?.documentType,
      documentId: customerData?.documentID,
      fullName: customerData?.fullName,
      portingDate: customerData?.portinDate,
    };
    this.http.post(`${environment.apiUrl}/portabilities`, body).subscribe({
      error: (error) => console.error('Could not record the port-in request:', error)
    });
  }

  async nipRequest(data: { donorNumber: string; donorOperator: string; donorPlan: string }, lovNumber: string): Promise<any> {
    try {
      console.debug('Submitting NIP request with data:', data, 'and LOV number:', lovNumber);
      const transformedLovNumber = this.msisdnPipe.transform(lovNumber);
      const transformedDonorNumber = this.msisdnPipe.transform(data.donorNumber);
      const url = `${this.gatewayUrl}/api/mnp/nip?msisdn=${transformedLovNumber}&newMsisdn=${transformedDonorNumber}`;

      const response = await firstValueFrom(this.http.get<ApiResponse<any>>(url));
      return response.payload;
    } catch (error: any) {
      console.error('Error submitting portin request:', error);
      throw error;
    }
  }

  async submitPortability(
    customerData: any,
    donorData: any,
    portabilityData: any
  ): Promise<any> {
    try {
      console.debug('Submitting portability request...');
      const subscriptionId = this.lovSubscription(portabilityData)?.id;

      const payload = {
        authCode: customerData.nip,
        donorOperator: donorData.donorOperatorCode,
        newMsisdn: this.msisdnPipe.transform(donorData.donorNumber),
        recipientOperator: '00018',
        requestedFutureDate: customerData.portinDate + 'T08:00:00.000Z',
        subscriberType: 'NATURAL',
        transparentData: {
          subscriberIdentityType: customerData.documentType,
          subscriberServiceType: donorData.donorPlan,
          subscriberIdentityIssue: customerData.documentIssueDate.replace(/-/g, '/'),
          subscriberName: customerData.fullName,
          subscriberAddress: customerData.address,
          nip: customerData.nip,
          subscriberIdentity: customerData.documentID
        }
      };

      console.debug('Portability request payload:', payload);

      const url = `${this.gatewayUrl}/api/mnp/portin/subscriptions/${subscriptionId}`;

      const response = await firstValueFrom(this.http.put<ApiResponse<any>>(url, payload));
      return response.payload;
    } catch (error: any) {
      console.error('Error submitting portability request:', error);
      throw error;
    }
  }

  // Reset methods
  resetDonorValidation(): void {
    this.donorValidationResult.set(null);
    this.donorValidationError.set(null);
    this.isValidatingDonorNumber.set(false);
  }

  resetSimValidation(): void {
    this.simValidationResult.set(null);
    this.simValidationError.set(null);
    this.isValidatingSim.set(false);
  }

  resetAll(): void {
    this.resetDonorValidation();
    this.resetSimValidation();
  }
}
