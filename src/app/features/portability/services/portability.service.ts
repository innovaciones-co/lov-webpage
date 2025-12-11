import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { MsisdnPipe } from '../../../core/pipes/msisdn.pipe';

// Interface for the API response structure
interface SubscriptionResponse {
  additionalInformationPlaceHolder?: {
    additionalInformationString?: string | null;
  };
  address?: {
    city: string;
    country: string;
    line1: string;
    state: string;
  };
  childCustomerIds?: any;
  consentToShareData?: boolean;
  contacts?: {
    portalAccount: string;
  };
  customerType?: string;
  document?: {
    id: string;
    type: string;
  };
  email?: string;
  emailVerified?: boolean;
  familyName?: string;
  givenName?: string;
  id?: number;
  languageId?: any;
  lastModified?: string;
  optedOutFromHouseholdDataShare?: boolean;
  parentCustomerId?: any;
  providerId?: number;
  registrationChannel?: string;
  registrationDate?: string;
  state?: string;
  subscriptions: Subscription[];
};

interface ApiResponse<T> {
  correlationId: string;
  payload: T;
  providerId: number;
  responseCode: number;
  responseDetail: string;
}

interface Subscription {
  activationDate?: string;
  currentDevice?: any;
  customerId?: string;
  iccid: string;
  id?: number;
  imsi?: string;
  initialDevice?: any;
  isPhoneDirectoryRegistered?: boolean;
  msisdn?: string;
  paymentType?: string;
  phoneDirectoryRegistered?: boolean;
  providerId?: number;
  state?: string;
  tariff?: {
    tariffId: number;
    tariffName: string;
  };
  type?: string;
}

interface LookupResponse {
  msisdn: string;
  operatorCode: string;
  operatorName: string;
  routingCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class PortabilityService {
  http = inject(HttpClient);
  msisdnPipe = inject(MsisdnPipe);

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
      const url = `${environment.gatewayUrl}/mnp/lookup/${donorNumber}`;
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

  async validateSimCard(msisdn: string, iccid: string): Promise<boolean> {
    this.isValidatingSim.set(true);
    this.simValidationError.set(null);
    this.simValidationResult.set(null);

    try {
      const transformedMsisdn = this.msisdnPipe.transform(msisdn);
      const url = `${environment.gatewayUrl}/api/subscriptions?msisdn=${transformedMsisdn}`;

      const response = await firstValueFrom(this.http.get<ApiResponse<SubscriptionResponse>>(url));

      // Check if any subscription's ICCID ends with the provided ICCID
      const isValid = response?.payload?.subscriptions?.some(subscription =>
        subscription.iccid?.endsWith(iccid)
      ) || false;

      this.simValidationResult.set(isValid);
      return isValid;
    } catch (error: any) {
      this.simValidationError.set(error.message || 'Error validating SIM card');
      this.simValidationResult.set(false);
      return false;
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
