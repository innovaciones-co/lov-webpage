import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';

export interface CardTokenRequest {
  number: string;
  exp_month: string;
  exp_year: string;
  name_card: string;
  payer_id: string;
  cvv?: string;
  method?: string;
}

export type CardTokenData = CardTokenRequest;

interface BackendTokenPayload extends CardTokenRequest {
  cardNumber: string;
  expirationMonth: string;
  expirationYear: string;
  cardholderName: string;
  payerId: string;
  securityCode?: string;
  brand: string;
}

export interface PaymentTokenResponse {
  id?: string;
  token?: string;
  description?: string;
  error?: string;
  message?: string;
  data?: {
    id?: string;
    token?: string;
    creditCardTokenId?: string;
    paymentMethod?: string;
    name?: string;
  };
  creditCardToken?: {
    id?: string;
    creditCardTokenId?: string;
    token?: string;
    name?: string;
    paymentMethod?: string;
  };
}

export type PayUTokenResponse = PaymentTokenResponse;

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly tokenEndpoint =
    (environment as { paymentTokenUrl?: string }).paymentTokenUrl ??
    `${environment.apiUrl}/paymentMethods/token`;

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

  private readonly messages = {
    invalidCard: 'Verifica los datos de tu tarjeta.',
    invalidExpiry: 'Fecha de expiración inválida.',
    connectivity: 'No fue posible generar el token de pago.',
  };

  createToken(cardData: CardTokenData): Observable<PaymentTokenResponse> {
    const normalizedCard = this.normalizeCardData(cardData);

    if (normalizedCard.method === 'UNKNOWN') {
      return throwError(() => new Error(this.messages.invalidCard));
    }

    if (!this.validateExpiry(normalizedCard.exp_month, normalizedCard.exp_year)) {
      return throwError(() => new Error(this.messages.invalidExpiry));
    }

    return this.http
      .post<PaymentTokenResponse>(
        this.tokenEndpoint,
        this.buildTokenPayload(normalizedCard),
        {
          headers: {
            accept: 'application/json',
          },
        }
      )
      .pipe(
        map((response) => this.normalizeResponse(response)),
        catchError((error: unknown) => throwError(() => this.toError(error)))
      );
  }

  getCardType(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/\D/g, '');

    for (const [brand, pattern] of Object.entries(this.patterns)) {
      if (new RegExp(pattern).test(cleanNumber)) {
        return brand;
      }
    }

    return 'UNKNOWN';
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

  private normalizeCardData(card: CardTokenData): CardTokenData {
    const cleanNumber = card.number.replace(/\D/g, '');
    const detectedMethod = card.method?.trim() || this.getCardType(cleanNumber);
    const sanitizedCvv = card.cvv?.replace(/\D/g, '') ?? '';

    return {
      ...card,
      number: cleanNumber,
      exp_month: card.exp_month.padStart(2, '0'),
      exp_year: card.exp_year.length === 2 ? `20${card.exp_year}` : card.exp_year,
      name_card: card.name_card.trim(),
      payer_id: card.payer_id.trim(),
      cvv: sanitizedCvv || undefined,
      method: detectedMethod,
    };
  }

  private buildTokenPayload(card: CardTokenData): BackendTokenPayload {
    return {
      ...card,
      cardNumber: card.number,
      expirationMonth: card.exp_month,
      expirationYear: card.exp_year,
      cardholderName: card.name_card,
      payerId: card.payer_id,
      securityCode: card.cvv,
      brand: card.method ?? 'UNKNOWN',
    };
  }

  private normalizeResponse(response: PaymentTokenResponse): PaymentTokenResponse {
    const nestedTokenData = response.data ?? response.creditCardToken;
    const token =
      response.token ??
      nestedTokenData?.token ??
      nestedTokenData?.creditCardTokenId ??
      response.id ??
      nestedTokenData?.id ??
      '';
    const id =
      response.id ?? nestedTokenData?.id ?? nestedTokenData?.creditCardTokenId ?? token;

    return {
      ...response,
      id,
      token,
    };
  }

  private toError(error: unknown): Error {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string') {
        return new Error(error.error || this.messages.connectivity);
      }

      if (typeof error.error === 'object' && error.error !== null) {
        const apiError = error.error as PaymentTokenResponse;

        return new Error(
          apiError.description ||
          apiError.error ||
          apiError.message ||
          this.messages.connectivity
        );
      }
    }

    if (error instanceof Error) {
      return error;
    }

    if (typeof error === 'string') {
      return new Error(error);
    }

    return new Error(this.messages.connectivity);
  }
}
