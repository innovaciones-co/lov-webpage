import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';

export interface PaymentRequest {
  payerId: string;
  name: string;
  identificationNumber: string;
  creditCardNumber: string;
  creditCardSecurityCode: number;
  creditCardExpirationMonth: number;
  creditCardExpirationYear: number;
  paymentMethod: string;
}

export type PaymentCardData = PaymentRequest;

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly patterns: Record<string, string> = {
    VISA: '^(4)(\\d{12}|\\d{15})$|^(606374\\d{10}$)',
    MASTERCARD:
      '^(5[1-5]\\d{14}$)|^(2(?:2(?:2[1-9]|[3-9]\\d)|[3-6]\\d\\d|7(?:[01]\\d|20))\\d{12}$)',
    AMEX: '^3[47][0-9]{13}$',
    DINERS:
      '(^[35](?:0[0-5]|[268][0-9])[0-9]{11}$)|(^30[0-5]{11}$)|(^3095(\\d{10})$)|(^36{12}$)|(^3[89](\\d{12})$)',
    NARANJA: '^(589562)\\d{10}$',
    SHOPPING: '(^603488(\\d{10})$)|(^2799(\\d{9})$)',
    CABAL: '(^604(([23][0-9][0-9])|(400))(\\d{10})$)|(^589657(\\d{10})$)',
    ARGENCARD: '^(501105|532362)(\\d{10}$)',
    CENCOSUD: '^603493(\\d{10})$',
    HIPERCARD: '^(384100|384140|384160|606282)(\\d{10}|\\d{13})$',
    CODENSA: '^590712(\\d{10})$',
    ELO:
      '(^(636368|438935|504175|451416|636297|650901|650485|650541|650700|650720|650720|650720|655021|650405)\\d{10})$|(^(5090|5067|4576|4011)\\d{12})$|(^(50904|50905|50906)\\d{11})$',
  };

  getCardType(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/\D/g, '');

    for (const [brand, pattern] of Object.entries(this.patterns)) {
      if (new RegExp(pattern).test(cleanNumber)) {
        return brand;
      }
    }

    return 'UNKNOWN';
  }

  createPaymentMethod(paymentMethodData: any): Observable<any> {
    console.debug('Creating payment method');
    console.log('Payment method data:', paymentMethodData);

    const url = `${this.apiUrl}/paymentMethods`;

    return this.http.post(url, paymentMethodData);
  }

  validateExpiry(month: string, year: string): boolean {
    const monthNumber = Number(month);
    const yearNumber = year.length === 2 ? Number(`20${year}`) : Number(year);

    if (!monthNumber || monthNumber < 1 || monthNumber > 12 || !yearNumber) {
      return false;
    }

    const today = new Date();
    const expiryDate = new Date(yearNumber, monthNumber, 0, 23, 59, 59, 999);

    return expiryDate >= today;
  }

}
