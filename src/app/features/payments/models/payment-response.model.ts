export interface PayUResponse {
    merchantId: string;
    merchant_name: string;
    merchant_address: string;
    telephone: string;
    merchant_url: string;
    transactionState: number;
    lapTransactionState: string;
    message: string;
    referenceCode: string;
    reference_pol: string;
    transactionId: string;
    description: string;
    trazabilityCode: string;
    cus: string;
    orderLanguage: string;
    extra1?: string; // MSISDN
    extra2?: string; // Document number
    extra3?: string;
    polTransactionState: number;
    signature: string;
    polResponseCode: number;
    lapResponseCode: string;
    risk?: string;
    polPaymentMethod: number;
    lapPaymentMethod: string;
    polPaymentMethodType: number;
    lapPaymentMethodType: string;
    installmentsNumber: number;
    TX_VALUE: number;
    TX_TAX: number;
    currency: string;
    lng: string;
    pseCycle?: string;
    buyerEmail: string;
    pseBank?: string;
    pseReference1?: string;
    pseReference2?: string;
    pseReference3?: string;
    authorizationCode?: string;
    khipuBank?: string;
    TX_ADMINISTRATIVE_FEE: number;
    TX_TAX_ADMINISTRATIVE_FEE: number;
    TX_TAX_ADMINISTRATIVE_FEE_RETURN_BASE: number;
    processingDate: string;
}

export enum PaymentStatus {
    APPROVED = 'APPROVED',
    DECLINED = 'DECLINED',
    ERROR = 'ERROR',
    PENDING = 'PENDING',
    EXPIRED = 'EXPIRED'
}

export enum TransactionState {
    APPROVED = 4,
    DECLINED = 6,
    ERROR = 104,
    PENDING = 7,
    EXPIRED = 5
}

export interface PurchaseStatus {
    status: PaymentStatus;
    transactionId: string;
    referenceCode: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    paymentMethodType: string;
    authorizationCode?: string;
    message: string;
    processingDate: string;
    orderDescription: string;
    buyerEmail: string;
    msisdn?: string;
    documentNumber?: string;
}