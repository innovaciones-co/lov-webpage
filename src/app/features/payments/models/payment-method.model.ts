enum PaymentMethod {
    BALANCE = 'BALANCE',
    CARD = 'CARD',
    WEB_CHECKOUT = 'WEB_CHECKOUT'
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
    /** The customer's default card: preselected at checkout and charged by recurring payments. */
    defaultMethod?: boolean;
    /** Whether this card can be charged by recurring payments / set as default (OnePay cards only). */
    chargeable?: boolean;
}

export interface TransparentData {
}


export default PaymentMethod;
