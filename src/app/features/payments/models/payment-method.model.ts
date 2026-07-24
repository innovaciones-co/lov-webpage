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
}

export interface TransparentData {
}


export default PaymentMethod;
