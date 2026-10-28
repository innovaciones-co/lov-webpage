enum PaymentMethod {
    BALANCE = 'BALANCE',
    CARD = 'CARD',
    WEB_CHECKOUT = 'WEB_CHECKOUT',
    NEQUI = 'NEQUI'
}

export interface PaymentMethodPayload {
    id: number;
    cvn: number;
    expiryMonth: number;
    expiryYear: number;
    holderName: string;
    issuer: string;
    paymentMethodType: string;
    transparentData: TransparentData;
    truncatedNumber: string;
    /** Default for the requested line: preselected at checkout and used for its recurring payments. */
    defaultMethod?: boolean;
    subscriberId?: number | null;
    /** Whether this card can be charged by recurring payments / set as default (OnePay cards only). */
    chargeable?: boolean;
}

export interface TransparentData {
}


export default PaymentMethod;
