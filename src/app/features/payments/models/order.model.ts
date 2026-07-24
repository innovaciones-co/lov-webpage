import PaymentMethod, { PaymentMethodPayload } from "./payment-method.model";
import { ProductType } from "./product.model";

export interface CreateOrderRequest {
    description: string;
    referenceCode: string;
    currency: string;
    buyerEmail: string;
    details: OrderDetails;
    subscriberId: number;
    msisdn: string;
    buyerPhone: string;
    buyerFullName: string;
    buyerDocumentType: string;
    buyerDocument: string;
    billingCountry: string;
    billingCity: string;
    billingAddress: string;
}

export interface OrderDetails {
    items: OrderItem[];
}

export interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    productId: string;
    tax: number;
    taxReturnBase: number;
    type: ProductType;
}


export interface FieldError {
    code: string;
    message: string;
    property: string;
    rejectedValue: any;
    path: string;
}

export interface OrderErrorResponse {
    status: number;
    code: string;
    message: string;
    fieldErrors: FieldError[];
}

export interface PaymentInitiationResponse {
    success: boolean;
    transactionId: string;
    message: string;
    checkoutUrl: string;
    checkoutData: PaymentCheckoutData;
    requiresAdditionalPayment: boolean;
    remainingAmount: number;
    currentBalance: number;
}

export interface PaymentCheckoutData {
    action: string;
    fields: PaymentFields;
}

export interface PaymentFields {
    merchantId: number;
    accountId: number;
    description: string;
    referenceCode: string;
    amount: number;
    tax: number;
    taxReturnBase: number;
    currency: string;
    signature: string;
    buyerEmail: string;
    buyerFullName: string,
    buyerDocumentType: string,
    buyerDocument: string,
    billingAddress: string,
    test: boolean;
    responseUrl: string;
    confirmationUrl: string;
    extra1: string;
    extra2: string;
}

export interface OrderPaymentRequest {
    paymentMethodType: PaymentMethod;
    cardData?: PaymentMethodPayload;
}

export interface CardData {
    payerId: string;
    name: string;
    identificationNumber: string;
    creditCardNumber: string;
    creditCardSecurityCode: number;
    creditCardExpirationMonth: string;
    creditCardExpirationYear: string;
    franchise: string;
}

export type OrderStatus = 'CREATED' | 'CANCELLED' | 'COMPLETED' | 'PAYMENT' | 'PROCESSED' | 'REFUNDED';

export type PaymentStatus = 'INITIATED' | 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR' | 'EXPIRED' | 'CANCELLED' | 'REFUNDED'

export interface OrderResponse {
    id: string;
    description: string;
    referenceCode: string;
    amount: number;
    transactionId: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    tax: number;
    taxReturnBase: number;
    currency: string;
    signature: string;
    details: OrderDetails;
    subscriberId: number;
    msisdn: string;
    buyerPhone: string;
    buyerFullName: string;
    buyerEmail: string;
    buyerDocumentType: string;
    buyerDocument: string;
    billingCountry: string;
    billingCity: string;
    billingAddress: string;
}
