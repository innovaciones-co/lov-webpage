import { Injectable } from '@angular/core';
import { PayUResponse, PaymentStatus, PurchaseStatus, TransactionState } from '../models/payment-response.model';

@Injectable({
    providedIn: 'root'
})
export class PaymentResponseService {

    /**
     * Convierte los parámetros de la URL de respuesta de PayU en un objeto PayUResponse
     */
    parseUrlParams(urlParams: URLSearchParams): PayUResponse {
        return {
            merchantId: urlParams.get('merchantId') || '',
            merchant_name: urlParams.get('merchant_name') || '',
            merchant_address: urlParams.get('merchant_address') || '',
            telephone: urlParams.get('telephone') || '',
            merchant_url: urlParams.get('merchant_url') || '',
            transactionState: Number(urlParams.get('transactionState')) || 0,
            lapTransactionState: urlParams.get('lapTransactionState') || '',
            message: urlParams.get('message') || '',
            referenceCode: urlParams.get('referenceCode') || '',
            reference_pol: urlParams.get('reference_pol') || '',
            transactionId: urlParams.get('transactionId') || '',
            description: urlParams.get('description') || '',
            trazabilityCode: urlParams.get('trazabilityCode') || '',
            cus: urlParams.get('cus') || '',
            orderLanguage: urlParams.get('orderLanguage') || 'es',
            extra1: urlParams.get('extra1') || undefined,
            extra2: urlParams.get('extra2') || undefined,
            extra3: urlParams.get('extra3') || undefined,
            polTransactionState: Number(urlParams.get('polTransactionState')) || 0,
            signature: urlParams.get('signature') || '',
            polResponseCode: Number(urlParams.get('polResponseCode')) || 0,
            lapResponseCode: urlParams.get('lapResponseCode') || '',
            risk: urlParams.get('risk') || undefined,
            polPaymentMethod: Number(urlParams.get('polPaymentMethod')) || 0,
            lapPaymentMethod: urlParams.get('lapPaymentMethod') || '',
            polPaymentMethodType: Number(urlParams.get('polPaymentMethodType')) || 0,
            lapPaymentMethodType: urlParams.get('lapPaymentMethodType') || '',
            installmentsNumber: Number(urlParams.get('installmentsNumber')) || 1,
            TX_VALUE: Number(urlParams.get('TX_VALUE')) || 0,
            TX_TAX: Number(urlParams.get('TX_TAX')) || 0,
            currency: urlParams.get('currency') || 'COP',
            lng: urlParams.get('lng') || 'es',
            pseCycle: urlParams.get('pseCycle') || undefined,
            buyerEmail: urlParams.get('buyerEmail') || '',
            pseBank: urlParams.get('pseBank') || undefined,
            pseReference1: urlParams.get('pseReference1') || undefined,
            pseReference2: urlParams.get('pseReference2') || undefined,
            pseReference3: urlParams.get('pseReference3') || undefined,
            authorizationCode: urlParams.get('authorizationCode') || undefined,
            khipuBank: urlParams.get('khipuBank') || undefined,
            TX_ADMINISTRATIVE_FEE: Number(urlParams.get('TX_ADMINISTRATIVE_FEE')) || 0,
            TX_TAX_ADMINISTRATIVE_FEE: Number(urlParams.get('TX_TAX_ADMINISTRATIVE_FEE')) || 0,
            TX_TAX_ADMINISTRATIVE_FEE_RETURN_BASE: Number(urlParams.get('TX_TAX_ADMINISTRATIVE_FEE_RETURN_BASE')) || 0,
            processingDate: urlParams.get('processingDate') || ''
        };
    }

    /**
     * Convierte la respuesta de PayU en un estado de compra procesado
     */
    convertTosPurchaseStatus(payuResponse: PayUResponse): PurchaseStatus {
        const status = this.mapTransactionStateToPaymentStatus(payuResponse.transactionState);

        return {
            status,
            transactionId: payuResponse.transactionId,
            referenceCode: payuResponse.referenceCode,
            amount: payuResponse.TX_VALUE,
            currency: payuResponse.currency,
            paymentMethod: payuResponse.lapPaymentMethod,
            paymentMethodType: payuResponse.lapPaymentMethodType,
            authorizationCode: payuResponse.authorizationCode,
            message: payuResponse.message,
            processingDate: payuResponse.processingDate,
            orderDescription: payuResponse.description,
            buyerEmail: decodeURIComponent(payuResponse.buyerEmail),
            msisdn: payuResponse.extra1 ? decodeURIComponent(payuResponse.extra1) : undefined,
            documentNumber: payuResponse.extra2 ? decodeURIComponent(payuResponse.extra2) : undefined
        };
    }

    /**
     * Mapea el estado de transacción de PayU a nuestro enum PaymentStatus
     */
    private mapTransactionStateToPaymentStatus(transactionState: number): PaymentStatus {
        switch (transactionState) {
            case TransactionState.APPROVED:
                return PaymentStatus.APPROVED;
            case TransactionState.DECLINED:
                return PaymentStatus.DECLINED;
            case TransactionState.ERROR:
                return PaymentStatus.ERROR;
            case TransactionState.PENDING:
                return PaymentStatus.PENDING;
            case TransactionState.EXPIRED:
                return PaymentStatus.EXPIRED;
            default:
                return PaymentStatus.ERROR;
        }
    }

    /**
     * Verifica la firma de la respuesta de PayU (implementación básica)
     * En producción, deberías implementar la verificación completa según la documentación de PayU
     */
    verifySignature(payuResponse: PayUResponse, apiKey: string): boolean {
        // TODO: Implementar verificación de firma según documentación de PayU
        // Esta es una implementación básica para propósitos de ejemplo
        console.warn('Verificación de firma no implementada completamente');
        return true;
    }

    /**
     * Procesa la URL completa de respuesta de PayU
     */
    processPaymentResponseUrl(url: string): PurchaseStatus {
        try {
            const urlObject = new URL(url);
            const params = urlObject.searchParams;
            const payuResponse = this.parseUrlParams(params);
            return this.convertTosPurchaseStatus(payuResponse);
        } catch (error) {
            console.error('Error procesando URL de respuesta de PayU:', error);
            throw new Error('URL de respuesta de PayU inválida');
        }
    }
}